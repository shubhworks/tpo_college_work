import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { buildOtpEmail, sendEmail } from '../lib/email';
import { hashPassword, verifyPassword } from '../lib/passwords';
import { clearUserCookie, getSessionSecret, setUserCookie } from '../lib/session';
import { clearFailures, isBlocked, recordFailure } from '../lib/rateLimit';
import { resolveUser } from '../middleware/adminAuth';

type Purpose = 'ACTIVATE' | 'RESET';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const SETUP_TOKEN_TTL = '15m';
const LOGIN_MAX_FAILURES = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const email = value.trim().toLowerCase();
    if (email.length > 255 || !EMAIL_RE.test(email)) return null;
    return email;
};

const hashOtp = (email: string, purpose: Purpose, otp: string) =>
    crypto.createHmac('sha256', getSessionSecret()).update(`${email}:${purpose}:${otp}`).digest('hex');

const safeEqual = (a: string, b: string) => {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

const parsePurpose = (value: unknown): Purpose | null =>
    value === 'ACTIVATE' || value === 'RESET' ? value : null;

/**
 * Step 1 - POST /api/auth/request-otp  { email, purpose: 'ACTIVATE' | 'RESET' }
 * Only whitelisted + active emails get an OTP. ACTIVATE is for accounts that
 * have no password yet, RESET for accounts that already have one.
 */
export const requestOtp = async (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    const purpose = parsePurpose(req.body?.purpose);

    if (!email) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!purpose) return res.status(400).json({ error: 'Invalid request.' });

    try {
        const user = await prisma.whitelistedEmail.findUnique({ where: { email } });

        if (!user || !user.isActive) {
            return res.status(403).json({
                error: 'This email is not authorised. Ask the TPO super admin to whitelist it.',
            });
        }
        if (purpose === 'ACTIVATE' && user.activatedAt) {
            return res.status(409).json({ error: 'This account is already activated. Please sign in.' });
        }
        if (purpose === 'RESET' && !user.activatedAt) {
            return res.status(409).json({ error: 'This account is not activated yet. Use First Time Activation.' });
        }

        const latest = await prisma.otpCode.findFirst({
            where: { email, purpose },
            orderBy: { createdAt: 'desc' },
        });
        if (latest && Date.now() - latest.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
            return res.status(429).json({ error: 'An OTP was just sent. Please wait a minute before requesting another.' });
        }

        const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

        await prisma.otpCode.deleteMany({ where: { email, purpose } });
        const record = await prisma.otpCode.create({
            data: {
                email,
                purpose,
                codeHash: hashOtp(email, purpose, otp),
                expiresAt: new Date(Date.now() + OTP_TTL_MS),
            },
        });

        try {
            await sendEmail({
                to: [{ email }],
                subject: purpose === 'ACTIVATE' ? 'Activate your TPO Portal account' : 'Reset your TPO Portal password',
                htmlContent: buildOtpEmail(otp, purpose),
            });
        } catch (mailError) {
            await prisma.otpCode.delete({ where: { id: record.id } }).catch(() => undefined);
            console.error('OTP email failed:', mailError);
            return res.status(502).json({ error: 'Could not send the OTP email. Please try again shortly.' });
        }

        return res.json({ success: true, message: 'OTP sent to your email.' });
    } catch (error) {
        console.error('Request OTP error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

/**
 * Step 2 - POST /api/auth/verify-otp  { email, purpose, otp }
 * On success returns a short-lived `setupToken` that authorises exactly one
 * thing: setting the password for that email.
 */
export const verifyOtp = async (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    const purpose = parsePurpose(req.body?.purpose);
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';

    if (!email || !purpose || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({ error: 'Enter the 6-digit OTP.' });
    }

    try {
        const record = await prisma.otpCode.findFirst({
            where: { email, purpose },
            orderBy: { createdAt: 'desc' },
        });

        if (!record || record.expiresAt < new Date()) {
            if (record) await prisma.otpCode.delete({ where: { id: record.id } }).catch(() => undefined);
            return res.status(400).json({ error: 'OTP expired or not requested. Please request a new one.' });
        }
        if (record.attempts >= OTP_MAX_ATTEMPTS) {
            await prisma.otpCode.delete({ where: { id: record.id } }).catch(() => undefined);
            return res.status(429).json({ error: 'Too many wrong attempts. Please request a new OTP.' });
        }

        if (!safeEqual(record.codeHash, hashOtp(email, purpose, otp))) {
            await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
            return res.status(400).json({ error: 'Incorrect OTP.' });
        }

        // The whitelist could have changed since the OTP was sent.
        const user = await prisma.whitelistedEmail.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            await prisma.otpCode.delete({ where: { id: record.id } }).catch(() => undefined);
            return res.status(403).json({ error: 'This email is no longer authorised.' });
        }

        await prisma.otpCode.delete({ where: { id: record.id } });

        const setupToken = jwt.sign({ typ: 'setup', email, purpose }, getSessionSecret(), {
            expiresIn: SETUP_TOKEN_TTL,
        });
        return res.json({ success: true, setupToken });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

/**
 * Step 3 - POST /api/auth/set-password  { setupToken, password }
 * Saves the password, marks the account activated and signs the user in.
 */
export const setPassword = async (req: Request, res: Response) => {
    const { setupToken, password } = req.body ?? {};

    if (typeof setupToken !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Invalid request.' });
    }
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
        return res.status(400).json({
            error: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters long.`,
        });
    }

    let claims: { typ?: string; email?: string; purpose?: Purpose };
    try {
        claims = jwt.verify(setupToken, getSessionSecret()) as typeof claims;
    } catch {
        return res.status(401).json({ error: 'Verification expired. Please start again.' });
    }
    if (claims.typ !== 'setup' || !claims.email || !claims.purpose) {
        return res.status(401).json({ error: 'Verification expired. Please start again.' });
    }

    try {
        const user = await prisma.whitelistedEmail.findUnique({ where: { email: claims.email } });
        if (!user || !user.isActive) {
            return res.status(403).json({ error: 'This email is no longer authorised.' });
        }
        if (claims.purpose === 'ACTIVATE' && user.activatedAt) {
            return res.status(409).json({ error: 'This account is already activated. Please sign in.' });
        }

        const updated = await prisma.whitelistedEmail.update({
            where: { id: user.id },
            data: {
                passwordHash: await hashPassword(password),
                activatedAt: user.activatedAt ?? new Date(),
                lastLoginAt: new Date(),
            },
        });

        setUserCookie(res, { uid: updated.id, email: updated.email, role: updated.role });
        return res.json({ success: true, user: { email: updated.email, role: updated.role } });
    } catch (error) {
        console.error('Set password error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

/** POST /api/auth/login  { email, password } */
export const login = async (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || typeof password !== 'string' || !password) {
        return res.status(400).json({ error: 'Enter your email and password.' });
    }

    const limitKey = `login:${email}`;
    if (isBlocked(limitKey, LOGIN_MAX_FAILURES)) {
        return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
    }

    try {
        const user = await prisma.whitelistedEmail.findUnique({ where: { email } });

        if (!user || !user.isActive) {
            recordFailure(limitKey, LOGIN_WINDOW_MS);
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        if (!user.passwordHash || !user.activatedAt) {
            return res.status(403).json({
                error: 'Account not activated yet. Use "First Time Activation" to set your password.',
                needsActivation: true,
            });
        }
        if (!(await verifyPassword(password, user.passwordHash))) {
            recordFailure(limitKey, LOGIN_WINDOW_MS);
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        clearFailures(limitKey);
        await prisma.whitelistedEmail.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        setUserCookie(res, { uid: user.id, email: user.email, role: user.role });
        return res.json({ success: true, user: { email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

/** POST /api/auth/logout */
export const logout = (_req: Request, res: Response) => {
    clearUserCookie(res);
    return res.json({ success: true });
};

/** GET /api/auth/me - current staff user, 401 if not signed in. */
export const me = async (req: Request, res: Response) => {
    const user = await resolveUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ email: user.email, role: user.role });
};
