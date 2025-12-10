import { z } from 'zod';

// Regex : Min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;

export const registerSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: "L'email est requis" })
            .email("Format d'email invalide"), 
        username: z
            .string({ required_error: "Le nom d'utilisateur est requis" })
            .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères")
            .max(20, "Le nom d'utilisateur ne doit pas dépasser 20 caractères")
            .regex(/^[a-zA-Z0-9_]+$/, "Caractères alphanumériques et underscores uniquement"), 
        password: z
            .string({ required_error: "Le mot de passe est requis" })
            .regex(passwordRegex, "Le mot de passe doit contenir 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre"), 
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Email invalide"),
        password: z.string().min(1, "Le mot de passe est requis"),
    }),
});