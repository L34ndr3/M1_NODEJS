import express from 'express';
import * as tournamentController from '../controllers/tournamentController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/authMiddlewares.js';
import { createTournamentSchema, updateTournamentSchema, updateStatusSchema } from '../schemas/tournamentSchema.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Tournament:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         game:
 *           type: string
 *         format:
 *           type: string
 *           enum: [SOLO, TEAM]
 *         maxParticipants:
 *           type: integer
 *         startDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [DRAFT, OPEN, ONGOING, COMPLETED, CANCELLED]
 *
 *     TournamentInput:
 *       type: object
 *       required:
 *         - name
 *         - game
 *         - format
 *         - maxParticipants
 *         - startDate
 *       properties:
 *         name:
 *           type: string
 *         game:
 *           type: string
 *         format:
 *           type: string
 *           enum: [SOLO, TEAM]
 *         maxParticipants:
 *           type: integer
 *         startDate:
 *           type: string
 *           format: date
 *
 *     StatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [OPEN, ONGOING, COMPLETED, CANCELLED]
 */

/**
 * @swagger
 * tags:
 *   - name: Tournaments
 *     description: Gestion des tournois
 */

/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: Liste des tournois
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste récupérée
 *
 *   post:
 *     summary: Créer un tournoi
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TournamentInput'
 *     responses:
 *       201:
 *         description: Créé
 */
router.get('/', tournamentController.getAll);
router.post('/', authenticate, authorize(['ORGANIZER', 'ADMIN']), validate(createTournamentSchema), tournamentController.create);

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     summary: Détail tournoi
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *
 *   put:
 *     summary: Modifier tournoi
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TournamentInput'
 *     responses:
 *       200:
 *         description: Modifié
 *
 *   delete:
 *     summary: Supprimer tournoi
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.get('/:id', tournamentController.getOne);
router.put('/:id', authenticate, authorize(['ORGANIZER', 'ADMIN']), validate(updateTournamentSchema), tournamentController.update);
router.delete('/:id', authenticate, authorize(['ORGANIZER', 'ADMIN']), tournamentController.remove);

/**
 * @swagger
 * /tournaments/{id}/status:
 *   patch:
 *     summary: Changer statut
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusInput'
 *     responses:
 *       200:
 *         description: Statut changé
 */
router.patch('/:id/status', authenticate, authorize(['ORGANIZER', 'ADMIN']), validate(updateStatusSchema), tournamentController.changeStatus);

export default router;
