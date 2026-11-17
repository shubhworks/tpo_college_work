import { Response } from 'express';
import jwt from 'jsonwebtoken';

export const USER_COOKIE = 'tpo_user';
const USER_SESSION_HOURS = 8;

export function getSessionSecret(): string {
    const secret = process.env.SESSION_SECRET;
    if (secret) return secret;
    if (process.env.NODE_ENV === 'production') {
        throw new Error('SESSION_SECRET is not set');
    }
    return 'default-session-secret';
}

export interface UserSessionPayload {
    typ: 'user';
    uid: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
}

export function setUserCookie(res: Response, payload: Omit<UserSessionPayload, 'typ'>) {
    const token = jwt.sign({ typ: 'user', ...payload }, getSessionSecret(), {
        expiresIn: `${USER_SESSION_HOURS}h`,
    });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(USER_COOKIE, token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: USER_SESSION_HOURS * 60 * 60 * 1000,
    });
}

export function clearUserCookie(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie(USER_COOKIE, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
    });
}
