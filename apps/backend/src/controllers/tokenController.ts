import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

export const validateToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-secret';

    if (!token) {
        return res.status(400).json({ error: "Token is required." });
    }

    try {
        const tokenRecord = await prisma.accessToken.findUnique({
            where: { token, isActive: true }
        });

        if (!tokenRecord) {
            return res.status(401).json({ error: "Link expired or invalid." });
        }

        if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
            return res.status(401).json({ error: "Link expired or invalid." });
        }

        // Update last used at
        await prisma.accessToken.update({
            where: { id: tokenRecord.id },
            data: { lastUsedAt: new Date() }
        });

        const sessionToken = jwt.sign(
            { tokenId: tokenRecord.id, label: tokenRecord.label },
            SESSION_SECRET,
            { expiresIn: '4h' }
        );

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('tpo_session', sessionToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
            maxAge: 4 * 60 * 60 * 1000 // 4 hours
        });

        return res.json({
            success: true,
            isPermanent: tokenRecord.expiresAt === null
        });

    } catch (error) {
        console.error("Token validation error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const checkSession = async (req: Request, res: Response) => {
    // This will be reached if tokenAuth middleware passes
    return res.json({ success: true });
};
