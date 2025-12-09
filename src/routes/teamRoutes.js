import express from 'express';
import * as teamController from '../controllers/teamController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authMiddlewares.js';
import { createTeamSchema, updateTeamSchema } from '../schemas/teamSchema.js';

const router = express.Router();

// Public : Voir les équipes
router.get('/', teamController.getAll);
router.get('/:id', teamController.getOne);

// Protégé : Créer une équipe (N'importe quel joueur connecté)
router.post(
    '/',
    authenticate,
    validate(createTeamSchema),
    teamController.create
);

// Protégé : Modifier (Seul le capitaine pourra, vérifié dans le service)
router.put(
    '/:id',
    authenticate,
    validate(updateTeamSchema),
    teamController.update
);

// Protégé : Supprimer
router.delete(
    '/:id',
    authenticate,
    teamController.remove
);

export default router;