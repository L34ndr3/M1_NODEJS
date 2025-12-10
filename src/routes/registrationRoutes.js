import express from 'express';
import * as registrationController from '../controllers/registrationController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authMiddlewares.js';
import { createRegistrationSchema, updateRegistrationSchema } from '../schemas/registrationSchema.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistrationInput:
 *       type: object
 *       properties:
 *         teamId:
 *           type: integer
 *           description: Requis pour tournoi TEAM
 *
 *     RegistrationStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, REJECTED, WITHDRAWN]
 */

/**
 * @swagger
 * tags:
 *   - name: Registrations
 *     description: Inscriptions aux tournois
 */

/**
 * @swagger
 * /tournaments/{tournamentId}/registrations:
 *   get:
 *     summary: Liste inscriptions
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste
 */
router.get('/:tournamentId/registrations', authenticate, registrationController.getAll);

/**
 * @swagger
 * /tournaments/{tournamentId}/register:
 *   post:
 *     summary: S'inscrire
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationInput'
 *     responses:
 *       201:
 *         description: Inscrit
 */
router.post('/:tournamentId/register', authenticate, validate(createRegistrationSchema), registrationController.register);

/**
 * @swagger
 * /tournaments/{tournamentId}/registrations/{id}:
 *   patch:
 *     summary: Modifier statut
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationStatusInput'
 *     responses:
 *       200:
 *         description: Modifié
 *
 *   delete:
 *     summary: Annuler inscription
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annulé
 */
router.patch('/:tournamentId/registrations/:id', authenticate, validate(updateRegistrationSchema), registrationController.updateStatus);
router.delete('/:tournamentId/registrations/:id', authenticate, registrationController.remove);

export default router;
