import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';

// Helper interne pour générer le token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN } // [cite: 111]
    );
};

export const register = async (userData) => {
    // 1. Vérification unicité [cite: 108, 109]
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email: userData.email }, { username: userData.username }],
        },
    });

    if (existingUser) {
        const error = new Error('Email ou nom d\'utilisateur déjà utilisé');
        error.statusCode = 409; // Conflict
        throw error;
    }

    // 2. Hashage password [cite: 111]
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // 3. Création user (Role par défaut PLAYER) [cite: 110]
    const newUser = await prisma.user.create({
        data: {
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            role: 'PLAYER',
        },
    });

    const token = generateToken(newUser);

    // On retire le mdp du retour
    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
};

export const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });

    // Sécurité : Message générique pour ne pas fuiter d'infos
    if (!user || !(await bcrypt.compare(password, user.password))) {
        const error = new Error('Identifiants incorrects'); // [cite: 106]
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user);
    const { password: pwd, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
};