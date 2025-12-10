import * as registrationService from '../services/registrationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    // Récupère l'ID tournoi depuis l'URL
    const result = await registrationService.getRegistrations(req.params.tournamentId);
    res.json({ success: true, data: result });
});

export const register = asyncHandler(async (req, res) => {
    // params.tournamentId + body.teamId + user.id
    const result = await registrationService.register(
        req.params.tournamentId,
        req.body.teamId,
        req.user.id
    );
    res.status(201).json({ success: true, data: result });
});

export const updateStatus = asyncHandler(async (req, res) => {
    const result = await registrationService.updateStatus(
        req.params.id, // ID de l'inscription
        req.body.status,
        req.user
    );
    res.json({ success: true, data: result });
});

export const remove = asyncHandler(async (req, res) => {
    await registrationService.deleteRegistration(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Inscription annulée' });
});