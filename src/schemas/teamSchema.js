import { z } from 'zod';

// Regex pour le Tag : 3 à 5 caractères, Majuscules et Chiffres uniquement
const tagRegex = /^[A-Z0-9]{3,5}$/;

export const createTeamSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Le nom est requis" })
            .min(3, "Le nom doit faire au moins 3 caractères")
            .max(50, "Le nom ne peut pas dépasser 50 caractères"),

        tag: z.string({ required_error: "Le tag est requis" })
            .regex(tagRegex, "Le tag doit faire 3 à 5 caractères (Majuscules et chiffres uniquement)"),
    }),
});

export const updateTeamSchema = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
        name: z.string().min(3).max(50).optional(),
        tag: z.string().regex(tagRegex).optional(),
    }),
});