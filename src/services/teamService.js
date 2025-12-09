import prisma from '../config/prisma.js';

// C.1 Liste
export const getAllTeams = async () => {
    return prisma.team.findMany({
        include: {
            captain: { select: { id: true, username: true, email: true } }, // Infos capitaine
            members: { select: { id: true, username: true } }, // Liste des membres (bonus)
        },
    });
};

// C.1 Détails
export const getTeamById = async (id) => {
    const team = await prisma.team.findUnique({
        where: { id: Number(id) },
        include: {
            captain: { select: { id: true, username: true, email: true } },
            members: { select: { id: true, username: true } },
            registrations: { include: { tournament: true } }, // Pour voir l'historique
        },
    });

    if (!team) {
        const error = new Error('Équipe introuvable');
        error.statusCode = 404;
        throw error;
    }
    return team;
};

// C.1 Créer
export const createTeam = async (data, userId, userRole) => {
    // C.2 Vérification Rôle : Seul un PLAYER peut créer une équipe
    if (userRole !== 'PLAYER') {
        const error = new Error('Seul un joueur peut créer une équipe');
        error.statusCode = 403;
        throw error;
    }

    // Vérification unicité Nom/Tag (Prisma le ferait, mais on peut anticiper pour un message clair)
    const existing = await prisma.team.findFirst({
        where: { OR: [{ name: data.name }, { tag: data.tag }] },
    });
    if (existing) {
        const error = new Error('Nom ou Tag déjà utilisé');
        error.statusCode = 409;
        throw error;
    }

    // Création : L'utilisateur devient capitaine et membre
    return prisma.team.create({
        data: {
            name: data.name,
            tag: data.tag,
            captainId: userId,
            members: {
                connect: { id: userId }, // Le capitaine est automatiquement ajouté aux membres
            },
        },
    });
};

// C.1 Modifier (Capitaine uniquement)
export const updateTeam = async (id, data, userId) => {
    const team = await getTeamById(id);

    if (team.captainId !== userId) {
        const error = new Error('Seul le capitaine peut modifier l\'équipe');
        error.statusCode = 403;
        throw error;
    }

    return prisma.team.update({
        where: { id: Number(id) },
        data,
    });
};

// C.1 Supprimer (Capitaine uniquement + Protection)
export const deleteTeam = async (id, userId) => {
    const team = await getTeamById(id);

    if (team.captainId !== userId) {
        const error = new Error('Seul le capitaine peut supprimer l\'équipe');
        error.statusCode = 403;
        throw error;
    }

    // C.2 Protection suppression (Tournoi actif)
    // On cherche une inscription à un tournoi OPEN ou ONGOING
    const activeRegistration = await prisma.registration.findFirst({
        where: {
            teamId: Number(id),
            tournament: {
                status: { in: ['OPEN', 'ONGOING'] },
            },
        },
    });

    if (activeRegistration) {
        const error = new Error('Impossible de supprimer une équipe inscrite à un tournoi en cours');
        error.statusCode = 400;
        throw error;
    }

    return prisma.team.delete({ where: { id: Number(id) } });
};