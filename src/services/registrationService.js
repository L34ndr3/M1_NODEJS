import prisma from '../config/prisma.js';

// D.1 Liste des inscriptions
export const getRegistrations = async (tournamentId) => {
    return prisma.registration.findMany({
        where: { tournamentId: Number(tournamentId) },
        include: {
            player: { select: { id: true, username: true, email: true } },
            team: { select: { id: true, name: true, tag: true } },
        },
    });
};

// D.1 & D.2 Inscription (La grosse logique)
export const register = async (tournamentId, teamId, userId) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id: Number(tournamentId) },
    });

    if (!tournament) throw new Error('Tournoi introuvable');

    // D.2 Statut tournoi : Uniquement si OPEN
    if (tournament.status !== 'OPEN') {
        throw new Error('Les inscriptions sont fermées (Tournoi non ouvert)');
    }

    // D.2 Limite participants : Compter les CONFIRMED
    const confirmedCount = await prisma.registration.count({
        where: {
            tournamentId: Number(tournamentId),
            status: 'CONFIRMED',
        },
    });

    if (confirmedCount >= tournament.maxParticipants) {
        throw new Error('Le tournoi est complet');
    }

    // Préparation des données d'inscription
    let registrationData = {
        tournamentId: Number(tournamentId),
        status: 'PENDING', // Statut par défaut
    };

    // --- LOGIQUE FORMAT (SOLO vs TEAM) ---

    if (tournament.format === 'SOLO') {
        // Cas SOLO
        if (teamId) {
            throw new Error('Ce tournoi est SOLO, impossible d\'inscrire une équipe');
        }
        registrationData.playerId = userId;

        // D.2 Unicité Joueur
        const existing = await prisma.registration.findFirst({
            where: { tournamentId: Number(tournamentId), playerId: userId },
        });
        if (existing) throw new Error('Vous êtes déjà inscrit à ce tournoi');

    } else {
        // Cas TEAM
        if (!teamId) {
            throw new Error('Ce tournoi est en ÉQUIPE, veuillez renseigner un teamId');
        }

        // D.2 Capitaine équipe
        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (!team) throw new Error('Équipe introuvable');

        if (team.captainId !== userId) {
            const error = new Error('Seul le capitaine peut inscrire son équipe');
            error.statusCode = 403;
            throw error;
        }

        registrationData.teamId = teamId;

        // D.2 Unicité Équipe
        const existing = await prisma.registration.findFirst({
            where: { tournamentId: Number(tournamentId), teamId: teamId },
        });
        if (existing) throw new Error('Cette équipe est déjà inscrite');
    }

    return prisma.registration.create({ data: registrationData });
};

// D.1 Modifier statut
export const updateStatus = async (registrationId, newStatus, user) => {
    const registration = await prisma.registration.findUnique({
        where: { id: Number(registrationId) },
        include: { tournament: true, team: true },
    });

    if (!registration) throw new Error('Inscription introuvable');

    // Vérification des droits :
    // - L'organisateur/Admin peut tout faire
    // - Le participant (Joueur ou Capitaine) ne peut que passer en WITHDRAWN
    const isOrganizer = user.role === 'ADMIN' || registration.tournament.organizerId === user.id;
    const isOwner = registration.playerId === user.id || (registration.team && registration.team.captainId === user.id);

    if (!isOrganizer) {
        if (!isOwner) {
            const error = new Error('Non autorisé');
            error.statusCode = 403;
            throw error;
        }
        // Le participant veut changer le statut
        if (newStatus !== 'WITHDRAWN') {
            throw new Error('Vous pouvez seulement annuler votre inscription (WITHDRAWN)');
        }
    }

    return prisma.registration.update({
        where: { id: Number(registrationId) },
        data: { status: newStatus },
    });
};

// D.1 Supprimer (Annuler si PENDING)
export const deleteRegistration = async (registrationId, user) => {
    const registration = await prisma.registration.findUnique({
        where: { id: Number(registrationId) },
        include: { tournament: true, team: true },
    });

    if (!registration) throw new Error('Inscription introuvable');

    // Droits (Admin, Orga ou Propriétaire)
    const isOrganizer = user.role === 'ADMIN' || registration.tournament.organizerId === user.id;
    const isOwner = registration.playerId === user.id || (registration.team && registration.team.captainId === user.id);

    if (!isOrganizer && !isOwner) {
        const error = new Error('Non autorisé');
        error.statusCode = 403;
        throw error;
    }

    // D.2 Annulation : CONFIRMED ne peut pas être DELETE
    if (registration.status === 'CONFIRMED') {
        throw new Error('Impossible de supprimer une inscription confirmée. Utilisez PATCH pour passer en WITHDRAWN.');
    }

    return prisma.registration.delete({
        where: { id: Number(registrationId) },
    });
};