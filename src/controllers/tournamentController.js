import * as tournamentService from '../services/tournamentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const result = await tournamentService.getAllTournaments(req.query);
    res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req, res) => {
    const result = await tournamentService.getTournamentById(req.params.id);
    res.json({ success: true, data: result });
});

export const create = asyncHandler(async (req, res) => {
    const result = await tournamentService.createTournament(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
});

export const update = asyncHandler(async (req, res) => {
    const result = await tournamentService.updateTournament(req.params.id, req.body, req.user);
    res.json({ success: true, data: result });
});

export const remove = asyncHandler(async (req, res) => {
    await tournamentService.deleteTournament(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Tournoi supprimé' });
});

export const changeStatus = asyncHandler(async (req, res) => {
    const result = await tournamentService.updateStatus(req.params.id, req.body.status, req.user);
    res.json({ success: true, data: result });
});