# E-sport Tournament Manager API

REST API to manage e-sport tournaments, teams, and player registrations.

## Installation

```bash
npm install
```

## Database Setup

This project uses **Prisma 7** with SQLite for data persistence.

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates database)
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed

# Open Prisma Studio (visual database browser)
npx prisma studio
```
## Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run start
```
Server starts on `http://localhost:3000`.

## Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example
```

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production/test) | development |
| DATABASE_URL | SQLite database path | file:./dev.db |
| JWT_SECRET | Secret for JWT tokens (min 32 chars) | - |
| JWT_EXPIRES_IN | Token expiration time | 24h |

Environment validation is handled by **Zod** in `src/config/env.js`. The server won't start if required variables are missing or invalid.

## Architecture

This project follows the **MVC pattern** adapted for Node.js/Express:

```
Routes → Controllers → Services → Prisma (Database)
```

- **Routes**: Define endpoints and apply middlewares (validation)
- **Controllers**: Handle HTTP request/response, delegate to services
- **Services**: Business logic and database operations
- **Utils**: Reusable helpers (asyncHandler, responseHelper)

### API Response Format

All API responses follow a standardized format:

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

## Authentication & Security

The API uses JWT (JSON Web Tokens) for authentication and bcrypt for password hashing.
Roles (RBAC)

Access control is managed by the authorize middleware.

    - PLAYER: Default role. Can join tournaments, create/manage their own team.

    - ORGANIZER: Can create and manage tournaments.

    - ADMIN: Full access, can force status changes and deletions.

## API Routes

### Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`

### Authentication : 

Method | Route | Description | Access 
POST   | /api/auth/register | Créer un compte (Rôle par défaut : PLAYER) | Public
POST   | /api/auth/login | Se connecter et récupérer le token JWT | Public
GET    | /api/auth/me | Récupérer les informations de l'utilisateur connecté | Authentified

### Tournaments : 

Method | Route | Description | Access
GET | /api/tournaments | "Liste des tournois (Filtres : ?status |  ?game |  ?format)" | Public
GET | /api/tournaments/:id | Détails complets d'un tournoi | Public
POST | /api/tournaments | Créer un tournoi (Statut initial : DRAFT) | Organizer / Admin
PUT | /api/tournaments/:id | Modifier un tournoi existant | Owner / Admin
DELETE | /api/tournaments/:id | Supprimer un tournoi (si aucune inscription confirmée) | Owner / Admin
PATCH | /api/tournaments/:id/status | Changer le statut (ex: DRAFT → OPEN) | Owner / Admin

### Teams : 

Method | Route | Description | Access
GET | /api/teams | Liste de toutes les équipes | Public
GET | /api/teams/:id | Détails d'une équipe avec ses membres | Public
POST | /api/teams | Créer une équipe (Le créateur devient Capitaine) | Player
PUT | /api/teams/:id | Modifier les infos de l'équipe | Capitaine
DELETE | /api/teams/:id | Supprimer l'équipe (si non inscrite à un tournoi actif) | Capitaine

### Registrations :

Method | Route | Description | Access
GET | /api/tournaments/:id/registrations | Liste des inscriptions pour un tournoi donné | Authentifié
POST | /api/tournaments/:id/register | S'inscrire (Solo ou Équipe selon le format) | Player / Capitaine
PATCH | /api/tournaments/:id/registrations/:regId | "Modifier le statut (ex: WITHDRAWN |  CONFIRMED)" | Owner / Admin
DELETE | /api/tournaments/:id/registrations/:regId | Annuler une inscription (Uniquement si PENDING) | Owner / Admin

## Règles Métier & Validations

L'API implémente des règles strictes via Zod et les Services :

    Tournois :

        startDate doit être future à la création.

        Flux de statut : DRAFT -> OPEN -> ONGOING -> COMPLETED.

        Impossible de passer en ONGOING sans au moins 2 participants.

    Équipes :

        Les Tags doivent faire 3 à 5 caractères alphanumériques majuscules.

        Impossible de supprimer une équipe inscrite dans un tournoi actif.

    Inscriptions :

        Cohérence : Un tournoi Solo refuse les équipes ; un tournoi Team refuse les joueurs seuls.

        Quotas : Inscription bloquée si maxParticipants est atteint.

        Unicité : Un joueur ou une équipe ne peut pas s'inscrire deux fois au même tournoi.

## Structure du projet 

src/
├── config/
│   ├── env.js         # Validation env avec Zod
│   └── prisma.js      # Client Prisma avec adaptateur Better-SQLite3
├── controllers/
│   ├── auth.controller.js
│   ├── tournament.controller.js
│   ├── team.controller.js
│   └── registration.controller.js
├── middlewares/
│   ├── auth.middleware.js  # Vérification JWT & RBAC
│   ├── validate.js         # Validation des schémas Zod
│   ├── errorHandler.js     # Gestion globale des erreurs
│   └── logger.js           # Logs des requêtes (Chalk)
├── routes/
│   ├── index.js            # Routeur principal
│   ├── auth.routes.js
│   ├── tournamentRoutes.js
│   ├── teamRoutes.js
│   └── registrationRoutes.js
├── schemas/                # Schémas Zod
│   ├── auth.schema.js
│   ├── tournamentSchema.js
│   ├── teamSchema.js
│   └── registrationSchema.js
├── services/               # Logique Métier
│   ├── auth.service.js
│   ├── tournament.service.js
│   ├── team.service.js
│   └── registration.service.js
└── server.js               # Point d'entrée

