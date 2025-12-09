import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';

// [cite: 113] authenticate
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, email: true, role: true }, // Pas de password
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
        }

        req.user = user; // Attache user à la requête
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }
};

// [cite: 114] authorize
export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ // [cite: 114] Retour 403
                success: false,
                message: 'Accès interdit',
            });
        }
        next();
    };
};