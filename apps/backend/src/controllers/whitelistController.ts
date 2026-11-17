import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { normalizeEmail } from './authController';

const toDto = (row: {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
    isActive: boolean;
    activatedAt: Date | null;
    lastLoginAt: Date | null;
    addedBy: string | null;
    createdAt: Date;
}) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    isActive: row.isActive,
    isActivated: row.activatedAt !== null,
    activatedAt: row.activatedAt,
    lastLoginAt: row.lastLoginAt,
    addedBy: row.addedBy,
    createdAt: row.createdAt,
});

export const listWhitelist = async (_req: Request, res: Response) => {
    try {
        const rows = await prisma.whitelistedEmail.findMany({
            orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
        });
        return res.json(rows.map(toDto));
    } catch (error) {
        console.error('List whitelist error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

export const addWhitelistedEmail = async (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: 'Enter a valid email address.' });

    try {
        const existing = await prisma.whitelistedEmail.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'This email is already whitelisted.' });

        const row = await prisma.whitelistedEmail.create({
            data: { email, role: 'ADMIN', addedBy: res.locals.user.email },
        });
        return res.status(201).json(toDto(row));
    } catch (error) {
        console.error('Add whitelist error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

/**
 * PATCH /api/admin/whitelist/:id  { email?, isActive? }
 * Changing the email hands the slot to a different person, so the old
 * password and activation are wiped and the new owner must activate.
 */
export const updateWhitelistedEmail = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { email: rawEmail, isActive } = req.body ?? {};

    try {
        const target = await prisma.whitelistedEmail.findUnique({ where: { id } });
        if (!target) return res.status(404).json({ error: 'Not found.' });
        if (target.role === 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'The super admin entry cannot be edited here.' });
        }

        const data: {
            email?: string;
            isActive?: boolean;
            passwordHash?: null;
            activatedAt?: null;
        } = {};

        if (rawEmail !== undefined) {
            const email = normalizeEmail(rawEmail);
            if (!email) return res.status(400).json({ error: 'Enter a valid email address.' });
            if (email !== target.email) {
                const clash = await prisma.whitelistedEmail.findUnique({ where: { email } });
                if (clash) return res.status(409).json({ error: 'This email is already whitelisted.' });
                data.email = email;
                data.passwordHash = null;
                data.activatedAt = null;
            }
        }
        if (isActive !== undefined) {
            if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'Invalid request.' });
            data.isActive = isActive;
        }

        const row = await prisma.whitelistedEmail.update({ where: { id }, data });
        if (data.email) await prisma.otpCode.deleteMany({ where: { email: target.email } });
        return res.json(toDto(row));
    } catch (error) {
        console.error('Update whitelist error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

export const removeWhitelistedEmail = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    try {
        const target = await prisma.whitelistedEmail.findUnique({ where: { id } });
        if (!target) return res.status(404).json({ error: 'Not found.' });
        if (target.role === 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'The super admin cannot be removed.' });
        }

        await prisma.whitelistedEmail.delete({ where: { id } });
        await prisma.otpCode.deleteMany({ where: { email: target.email } });
        return res.json({ success: true });
    } catch (error) {
        console.error('Remove whitelist error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
