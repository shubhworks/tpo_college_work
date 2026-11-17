import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import crypto from 'crypto';

export const listTokens = async (req: Request, res: Response) => {
    try {
        const tokens = await prisma.accessToken.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return res.json(tokens);
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

export const updateTokenExpiry = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { expiry } = req.body;

    let expiresAt: Date | null = null;
    if (expiry && expiry !== 'never') {
        const now = new Date();
        if (expiry === '1d') expiresAt = new Date(now.setDate(now.getDate() + 1));
        else if (expiry === '7d') expiresAt = new Date(now.setDate(now.getDate() + 7));
        else if (expiry === '30d') expiresAt = new Date(now.setDate(now.getDate() + 30));
    }

    try {
        const updatedToken = await prisma.accessToken.update({
            where: { id },
            data: { 
                expiresAt,
                isActive: true // Reactivate the token when expiry is updated
            }
        });

        return res.json(updatedToken);
    } catch (error) {
        console.error("Update token expiry error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};
