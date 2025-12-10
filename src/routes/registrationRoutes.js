import express from 'express';
import * as registrationController from '../controllers/registrationController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/authMiddlewares.js';
import { createRegistrationSchema, updateRegistrationSchema } from '../schemas/registrationSchema.js';

// mergeParams: true est CRUCIAL pour récupérer :tournamentId défini dans le fichier parent ou l'URL
const router = express.Router({ mergeParams: true });

// D.1 Routes

// GET /api/tournaments/:tournamentId/registrations
router.get(
    '/:tournamentId/registrations',
    authenticate,
    registrationController.getAll
);

// POST /api/tournaments/:tournamentId/register
router.post(
    '/:tournamentId/register',
    authenticate,
    validate(createRegistrationSchema),
    registrationController.register
);

// PATCH /api/tournaments/:tournamentId/registrations/:id
router.patch(
    '/:tournamentId/registrations/:id',
    authenticate,
    validate(updateRegistrationSchema),
    registrationController.updateStatus
);

// DELETE /api/tournaments/:tournamentId/registrations/:id
router.delete(
    '/:tournamentId/registrations/:id',
    authenticate,
    registrationController.remove
);

export default router;