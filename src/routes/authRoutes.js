import express from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../schemas/authSchema.js';
import { authenticate } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// A.1 Routes et validations
// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// Route Bonus : Vérifier qui est connecté (nécessite le token)
router.get('/me', authenticate, authController.getMe);

export default router;