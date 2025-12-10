import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

// 1. Page d'accueil : Tournois OUVERTS + Liste des ÉQUIPES
router.get('/', async (req, res) => {
    const [allTournaments, teams] = await Promise.all([
        // On enlève le "where: { status: 'OPEN' }" pour tout récupérer
        prisma.tournament.findMany({
            orderBy: { startDate: 'desc' } // Plus récents en premier
        }),
        prisma.team.findMany({
            orderBy: { name: 'asc' },
            include: {
                captain: { select: { username: true } },
                _count: { select: { members: true } }
            }
        })
    ]);

    // Regroupement par statut
    const groupedTournaments = {
        ONGOING: [],
        OPEN: [],
        DRAFT: [],
        COMPLETED: [],
        CANCELLED: []
    };

    allTournaments.forEach(t => {
        if (groupedTournaments[t.status]) {
            groupedTournaments[t.status].push(t);
        }
    });

    res.render('pages/home', {
        title: 'Accueil',
        groupedTournaments, // On passe l'objet groupé
        teams
    });
});

// Page Création Tournoi (Ajouter AVANT la route /tournaments/:id)
router.get('/tournaments/new', (req, res) => {
    res.render('pages/createTournament', { title: 'Créer un tournoi' });
});

// 2. Page Détail Tournoi
router.get('/tournaments/:id', async (req, res) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id: Number(req.params.id) },
        include: {
            registrations: {
                include: {
                    player: true,
                    team: true
                }
            }
        }
    });

    if (!tournament) return res.redirect('/');

    res.render('pages/tournament', {
        title: tournament.name,
        tournament
    });
});

// 3. Pages Auth
router.get('/login', (req, res) => {
    res.render('pages/login', { title: 'Connexion' });
});

router.get('/register', (req, res) => {
    res.render('pages/register', { title: 'Inscription' });
});

router.get('/me', (req, res) => {
  res.render('pages/profile', { title: 'Mon Profil' });
});

// Page Création Équipe
router.get('/teams/new', (req, res) => {
    res.render('pages/createTeam', { title: 'Créer une équipe' });
});

// Page Édition Équipe
router.get('/teams/:id/edit', async (req, res) => {
    const team = await prisma.team.findUnique({
        where: { id: Number(req.params.id) }
    });

    if (!team) return res.redirect('/');

    res.render('pages/editTeam', {
        title: `Modifier ${team.name}`,
        team
    });
});

export default router;