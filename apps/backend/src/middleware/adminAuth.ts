import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { USER_COOKIE, UserSessionPayload, getSessionSecret } from '../lib/session';

export interface AuthedUser {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
}

/**
 * Resolve the staff user behind the `tpo_user` cookie. The whitelist row is
 * re-checked on every call so deactivating or deleting an email takes effect
 * immediately, not when the JWT expires.
 */
export async function resolveUser(req: Request): Promise<AuthedUser | null> {
    const cookie = req.cookies?.[USER_COOKIE];
    if (!cookie) return null;

    try {
        const decoded = jwt.verify(cookie, getSessionSecret()) as UserSessionPayload;
        if (decoded.typ !== 'user') return null;

        const user = await prisma.whitelistedEmail.findUnique({ where: { id: decoded.uid } });
        if (!user || !user.isActive || !user.activatedAt) return null;

        return { id: user.id, email: user.email, role: user.role };
    } catch {
        return null;
    }
}

/** Any signed-in, active staff member. */
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    const user = await resolveUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.locals.user = user;
    next();
};

/** Only the super admin. */
export const superAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
    const user = await resolveUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Super admin only.' });
    res.locals.user = user;
    next();
};
