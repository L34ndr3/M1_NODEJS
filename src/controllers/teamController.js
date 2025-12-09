import * as teamService from '../services/teamService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const teams = await teamService.getAllTeams();
    res.json({ success: true, data: teams });
});

export const getOne = asyncHandler(async (req, res) => {
    const team = await teamService.getTeamById(req.params.id);
    res.json({ success: true, data: team });
});

export const create = asyncHandler(async (req, res) => {
    // On passe ID et ROLE pour la vérification C.2
    const team = await teamService.createTeam(req.body, req.user.id, req.user.role);
    res.status(201).json({ success: true, data: team });
});

export const update = asyncHandler(async (req, res) => {
    const team = await teamService.updateTeam(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: team });
});

export const remove = asyncHandler(async (req, res) => {
    await teamService.deleteTeam(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Équipe supprimée' });
});