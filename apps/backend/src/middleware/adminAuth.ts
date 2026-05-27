import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    const adminCookie = req.cookies['tpo_admin'];
    const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-secret';

    if (!adminCookie) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(adminCookie, SESSION_SECRET) as any;
        
        if (decoded.role !== 'admin') {
            return res.status(401).json({ error: "Unauthorized" });
        }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
