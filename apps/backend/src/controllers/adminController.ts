import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const adminLogin = async (req: Request, res: Response) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-secret';

    if (!ADMIN_PASSWORD) {
        console.error("ADMIN_PASSWORD is not set in environment variables.");
        return res.status(500).json({ error: "Admin access not configured." });
    }

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Invalid admin password." });
    }

    const adminToken = jwt.sign(
        { role: 'admin' },
        SESSION_SECRET,
        { expiresIn: '8h' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    
    res.cookie('tpo_admin', adminToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    return res.json({ success: true });
};

export const listTokens = async (req: Request, res: Response) => {
    try {
        const tokens = await prisma.accessToken.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Mask tokens for security: abc1...xyz
        const maskedTokens = tokens.map((t: any) => ({
            ...t,
            token: `${t.token.substring(0, 4)}...${t.token.substring(t.token.length - 4)}`
        }));

        return res.json(maskedTokens);
    } catch (error) {
        console.error("List tokens error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const createToken = async (req: Request, res: Response) => {
    const { label, expiry } = req.body;

    if (!label) {
        return res.status(400).json({ error: "Label is required." });
    }

    let expiresAt: Date | null = null;
    if (expiry && expiry !== 'never') {
        const now = new Date();
        if (expiry === '1d') expiresAt = new Date(now.setDate(now.getDate() + 1));
        else if (expiry === '7d') expiresAt = new Date(now.setDate(now.getDate() + 7));
        else if (expiry === '30d') expiresAt = new Date(now.setDate(now.getDate() + 30));
    }

    try {
        const newToken = crypto.randomUUID();
        const tokenRecord = await prisma.accessToken.create({
            data: {
                token: newToken,
                label,
                expiresAt,
                isActive: true
            }
        });

        return res.json({
            ...tokenRecord,
            fullToken: newToken // Return the full token only once upon creation
        });
    } catch (error) {
        console.error("Create token error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const revokeToken = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    try {
        await prisma.accessToken.update({
            where: { id },
            data: { isActive: false }
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("Revoke token error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};
