import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body); 
    res.status(201).json({
        success: true,
        data: result,
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password); 
    res.status(200).json({
        success: true,
        data: result,
    });
});

export const getMe = asyncHandler(async (req, res) => {
    // Route bonus pour tester le middleware
    res.status(200).json({
        success: true,
        data: req.user,
    });
});