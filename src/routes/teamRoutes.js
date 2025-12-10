import express from 'express';
import * as teamController from '../controllers/teamController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authMiddlewares.js';
import { createTeamSchema, updateTeamSchema } from '../schemas/teamSchema.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         tag:
 *           type: string
 *         captainId:
 *           type: integer
 *
 *     TeamInput:
 *       type: object
 *       required:
 *         - name
 *         - tag
 *       properties:
 *         name:
 *           type: string
 *         tag:
 *           type: string
 *           description: 3-5 chars, Majuscules + Chiffres
 */

/**
 * @swagger
 * tags:
 *   - name: Teams
 *     description: Gestion des équipes
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Liste équipes
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Liste
 *
 *   post:
 *     summary: Créer équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamInput'
 *     responses:
 *       201:
 *         description: Créé
 */
router.get('/', teamController.getAll);
router.post('/', authenticate, validate(createTeamSchema), teamController.create);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Détail équipe
 *     tags: [Teams]
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
 *               $ref: '#/components/schemas/Team'
 *
 *   put:
 *     summary: Modifier équipe
 *     tags: [Teams]
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
 *             $ref: '#/components/schemas/TeamInput'
 *     responses:
 *       200:
 *         description: Modifié
 *
 *   delete:
 *     summary: Supprimer équipe
 *     tags: [Teams]
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
router.get('/:id', teamController.getOne);
router.put('/:id', authenticate, validate(updateTeamSchema), teamController.update);
router.delete('/:id', authenticate, teamController.remove);

export default router;
