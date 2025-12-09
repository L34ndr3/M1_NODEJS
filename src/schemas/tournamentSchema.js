import { z } from 'zod';

// On définit les valeurs directement dans le schéma pour éviter les erreurs de type
const createTournamentSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Le nom est requis" }).min(3).max(50),
        game: z.string({ required_error: "Le jeu est requis" }),
        // Correction ici : liste explicite
        format: z.enum(['SOLO', 'TEAM'], { required_error: "Le format est requis (SOLO ou TEAM)" }),
        maxParticipants: z.number({ required_error: "Le nombre max de participants est requis" }).int().positive(),
        prizePool: z.number().nonnegative().optional().default(0),
        startDate: z.coerce.date().refine((date) => date > new Date(), {
            message: "La date de début doit être dans le futur",
        }),
        endDate: z.coerce.date().optional(),
    }).refine((data) => {
        // Validation croisée : Si endDate existe, elle doit être après startDate
        if (data.endDate && data.startDate) {
            return data.endDate > data.startDate;
        }
        return true;
    }, {
        message: "La date de fin doit être après la date de début",
        path: ["body", "endDate"],
    }),
});

const updateTournamentSchema = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
        name: z.string().min(3).max(50).optional(),
        game: z.string().optional(),
        format: z.enum(['SOLO', 'TEAM']).optional(),
        maxParticipants: z.number().int().positive().optional(),
        prizePool: z.number().nonnegative().optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
    }),
});

const updateStatusSchema = z.object({
    params: z.object({ id: z.coerce.number() }),
    body: z.object({
        // Correction ici : liste explicite des statuts
        status: z.enum(['DRAFT', 'OPEN', 'ONGOING', 'COMPLETED', 'CANCELLED'], {
            required_error: "Le statut est requis"
        }),
    }),
});

// Exportation nommée explicite à la fin (plus propre pour VS Code)
export { createTournamentSchema, updateTournamentSchema, updateStatusSchema };