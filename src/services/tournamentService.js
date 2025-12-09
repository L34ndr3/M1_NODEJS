import prisma from '../config/prisma.js';

// Récupérer la liste (avec filtres et pagination)
export const getAllTournaments = async (query) => {
    const { page = 1, limit = 10, status, game, format } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status) where.status = status;
    if (game) where.game = { contains: game };
    if (format) where.format = format;

    const [tournaments, total] = await Promise.all([
        prisma.tournament.findMany({
            where,
            skip,
            take: Number(limit),
            include: { organizer: { select: { username: true, email: true } } },
            orderBy: { startDate: 'asc' },
        }),
        prisma.tournament.count({ where }),
    ]);

    return {
        data: tournaments,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
};

export const getTournamentById = async (id) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id: Number(id) },
        include: {
            organizer: { select: { id: true, username: true } },
            registrations: true,
        },
    });
    if (!tournament) {
        const error = new Error('Tournoi introuvable');
        error.statusCode = 404;
        throw error;
    }
    return tournament;
};

export const createTournament = async (data, organizerId) => {
    return prisma.tournament.create({
        data: {
            ...data,
            status: 'DRAFT',
            organizerId,
        },
    });
};

export const updateTournament = async (id, data, user) => {
    const tournament = await getTournamentById(id);

    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
        const error = new Error('Non autorisé à modifier ce tournoi');
        error.statusCode = 403;
        throw error;
    }

    if (['COMPLETED', 'CANCELLED'].includes(tournament.status)) {
        throw new Error('Impossible de modifier un tournoi terminé ou annulé');
    }

    return prisma.tournament.update({
        where: { id: Number(id) },
        data,
    });
};

export const deleteTournament = async (id, user) => {
    const tournament = await getTournamentById(id);

    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
        const error = new Error('Non autorisé à supprimer ce tournoi');
        error.statusCode = 403;
        throw error;
    }

    const confirmedCount = await prisma.registration.count({
        where: { tournamentId: Number(id), status: 'CONFIRMED' },
    });

    if (confirmedCount > 0) {
        throw new Error('Impossible de supprimer un tournoi avec des inscriptions confirmées');
    }

    await prisma.registration.deleteMany({ where: { tournamentId: Number(id) } });
    return prisma.tournament.delete({ where: { id: Number(id) } });
};

export const updateStatus = async (id, newStatus, user) => {
    const tournament = await getTournamentById(id);
    const currentStatus = tournament.status;

    if (user.role !== 'ADMIN' && tournament.organizerId !== user.id) {
        const error = new Error('Non autorisé');
        error.statusCode = 403;
        throw error;
    }

    // Logique de transition d'état
    if (newStatus === 'CANCELLED') {
        // Autorisé à tout moment pour le propriétaire/admin
    } else if (newStatus === 'COMPLETED') {
        if (user.role !== 'ADMIN') {
            const error = new Error('Seul un administrateur peut terminer un tournoi');
            error.statusCode = 403;
            throw error;
        }
    } else if (currentStatus === 'DRAFT' && newStatus === 'OPEN') {
        if (new Date(tournament.startDate) <= new Date()) {
            throw new Error('La date de début doit être future pour ouvrir le tournoi');
        }
    } else if (currentStatus === 'OPEN' && newStatus === 'ONGOING') {
        const confirmedCount = await prisma.registration.count({
            where: { tournamentId: Number(id), status: 'CONFIRMED' },
        });
        if (confirmedCount < 2) {
            throw new Error('Il faut au moins 2 participants confirmés pour lancer le tournoi');
        }
    }

    return prisma.tournament.update({
        where: { id: Number(id) },
        data: { status: newStatus },
    });
};