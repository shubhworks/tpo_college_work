import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { resolveUser } from './adminAuth';

/**
 * Portal data access: either a recruiter access-link session (`tpo_session`)
 * or a signed-in staff user (`tpo_user`).
 */
export const tokenAuth = async (req: Request, res: Response, next: NextFunction) => {
    const sessionCookie = req.cookies['tpo_session'];
    const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-secret';

    if (sessionCookie) {
        try {
            jwt.verify(sessionCookie, SESSION_SECRET);
            return next();
        } catch {
            // fall through to the staff session check
        }
    }

    const user = await resolveUser(req);
    if (user) {
        res.locals.user = user;
        return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
};
