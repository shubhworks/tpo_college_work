import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const tokenAuth = (req: Request, res: Response, next: NextFunction) => {
    const sessionCookie = req.cookies['tpo_session'];
    const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-secret';

    if (!sessionCookie) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        jwt.verify(sessionCookie, SESSION_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
