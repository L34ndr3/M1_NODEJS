import express from 'express';
import authRoutes from './authRoutes.js';
import tournamentRoutes from './tournamentRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);

export default router;
router.use('/tournaments', tournamentRoutes);