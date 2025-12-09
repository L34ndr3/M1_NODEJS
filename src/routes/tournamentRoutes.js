import express from 'express';
import * as tournamentController from '../controllers/tournamentController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/authMiddlewares.js';
import {
    createTournamentSchema,
    updateTournamentSchema,
    updateStatusSchema
} from '../schemas/tournamentSchema.js';

const router = express.Router();

router.get('/', tournamentController.getAll);
router.get('/:id', tournamentController.getOne);

router.post(
    '/',
    authenticate,
    authorize(['ORGANIZER', 'ADMIN']),
    validate(createTournamentSchema),
    tournamentController.create
);

router.put(
    '/:id',
    authenticate,
    authorize(['ORGANIZER', 'ADMIN']),
    validate(updateTournamentSchema),
    tournamentController.update
);

router.delete(
    '/:id',
    authenticate,
    authorize(['ORGANIZER', 'ADMIN']),
    tournamentController.remove
);

router.patch(
    '/:id/status',
    authenticate,
    authorize(['ORGANIZER', 'ADMIN']),
    validate(updateStatusSchema),
    tournamentController.changeStatus
);

export default router;