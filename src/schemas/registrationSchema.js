import { z } from 'zod';

const RegistrationStatus = ['PENDING', 'CONFIRMED', 'REJECTED', 'WITHDRAWN'];

// Inscription : On valide params (ID tournoi) et body (teamId optionnel)
export const createRegistrationSchema = z.object({
    params: z.object({
        tournamentId: z.coerce.number(),
    }),
    body: z.object({
        // teamId est optionnel. S'il est présent, c'est une inscription équipe.
        // Sinon, c'est implicitement une inscription SOLO (via le token user).
        teamId: z.number().int().positive().optional(),
    }),
});

// Mise à jour du statut (PATCH)
export const updateRegistrationSchema = z.object({
    params: z.object({
        tournamentId: z.coerce.number(),
        id: z.coerce.number(), // ID de l'inscription
    }),
    body: z.object({
        status: z.enum(RegistrationStatus, { required_error: "Le statut est requis" }),
    }),
});