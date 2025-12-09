import express from 'express';
import authRoutes from './authRoutes.js';
import tournamentRoutes from './tournamentRoutes.js';
import teamRoutes from './teamRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/teams', teamRoutes);

export default router;