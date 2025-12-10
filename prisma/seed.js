// prisma/seed.js
import prisma from '../src/config/prisma.js'
import bcrypt from 'bcrypt'

// --- DONNÉES STATIQUES ---

const tournamentsData = [
    {
        name: 'Worlds 2025',
        game: 'League of Legends',
        format: 'TEAM',
        maxParticipants: 16,
        prizePool: 2000000,
        startDate: new Date('2025-10-01'),
        status: 'OPEN',
    },
    {
        name: 'Valorant Champions',
        game: 'Valorant',
        format: 'TEAM',
        maxParticipants: 8,
        prizePool: 1000000,
        startDate: new Date('2024-08-01'),
        status: 'COMPLETED',
    },
    {
        name: 'Evo 2025 - Street Fighter 6',
        game: 'Street Fighter 6',
        format: 'SOLO',
        maxParticipants: 128,
        prizePool: 50000,
        startDate: new Date('2025-07-15'),
        status: 'OPEN',
    },
]

async function main() {
    console.log('🌱 Début du seeding (sécurisé)...')

    // 1. SÉCURITÉ : Récupération du mot de passe depuis l'environnement
    const rawPassword = process.env.SEED_PASSWORD

    if (!rawPassword) {
        console.error('❌ Erreur critique : La variable SEED_PASSWORD est manquante dans le fichier .env')
        console.error('   Veuillez ajouter SEED_PASSWORD="VotreMotDePasse" dans votre .env avant de lancer le seed.')
        process.exit(1)
    }

    // Hashage du mot de passe récupéré
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    // 2. Nettoyage
    console.log('🧹 Nettoyage de la base de données...')
    await prisma.registration.deleteMany()
    await prisma.tournament.deleteMany()
    await prisma.user.updateMany({ data: { teamId: null } })
    await prisma.team.deleteMany()
    await prisma.user.deleteMany()

    // 3. Création Admin & Orga
    console.log('👤 Création des utilisateurs...')
    const organizer = await prisma.user.create({
        data: {
            username: 'OrgaUser',
            email: 'organizer@esport.com',
            password: hashedPassword, // Utilise le mdp hashé issu du .env
            role: 'ORGANIZER',
        },
    })

    // Admin
    await prisma.user.create({
        data: {
            username: 'AdminUser',
            email: 'admin@esport.com',
            password: hashedPassword,
            role: 'ADMIN'
        }
    })

    // 4. Création Joueurs
    const faker = await prisma.user.create({
        data: { username: 'Faker', email: 'faker@t1.com', password: hashedPassword, role: 'PLAYER' }
    })

    const zeus = await prisma.user.create({
        data: { username: 'Zeus', email: 'zeus@t1.com', password: hashedPassword, role: 'PLAYER' }
    })

    const soloPlayer = await prisma.user.create({
        data: { username: 'soloplayer', email: 'solo@player.com', password: hashedPassword, role: 'PLAYER' }
    })

    // 5. Création Équipe T1
    console.log('🛡️ Création des équipes...')
    const teamT1 = await prisma.team.create({
        data: {
            name: 'SK Telecom T1',
            tag: 'T1',
            captainId: faker.id,
            members: {
                connect: [{ id: faker.id }, { id: zeus.id }]
            }
        }
    })

    // 6. Création Tournois
    console.log('🏆 Création des tournois...')
    const createdTournaments = []
    for (const t of tournamentsData) {
        const tournament = await prisma.tournament.create({
            data: { ...t, organizerId: organizer.id }
        })
        createdTournaments.push(tournament)
    }

    // 7. Inscriptions
    console.log('📝 Création des inscriptions...')
    const lolTournament = createdTournaments.find(t => t.game === 'League of Legends')
    if (lolTournament) {
        await prisma.registration.create({
            data: {
                tournamentId: lolTournament.id,
                teamId: teamT1.id,
                status: 'CONFIRMED'
            }
        })
    }

    const sfTournament = createdTournaments.find(t => t.game === 'Street Fighter 6')
    if (sfTournament) {
        await prisma.registration.create({
            data: {
                tournamentId: sfTournament.id,
                playerId: soloPlayer.id,
                status: 'PENDING'
            }
        })
    }

    console.log('🚀 Seeding terminé avec succès !')
}

main()
    .catch(e => {
        console.error('❌ Erreur lors du seeding :', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })