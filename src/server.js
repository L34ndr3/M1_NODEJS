import express from 'express'
import session from 'express-session'
import chalk from 'chalk'
// import swaggerUi from 'swagger-ui-express' // Bonus : À décommenter plus tard
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configuration
import { env } from './config/env.js'
import prisma from './config/prisma.js'

// Routes
import apiRoutes from './routes/index.js'
// import viewRoutes from './routes/viewRoutes.js'      // Frontend : À faire plus tard
// import viewAuthRoutes from './routes/viewAuthRoutes.js'
// import viewAdminRoutes from './routes/viewAdminRoutes.js'

// Config Swagger (Bonus)
// import { swaggerSpec } from './config/swagger.js'

// Utils
// import { icon } from './utils/icons.js' // Frontend : À faire plus tard

// Middlewares
import { logger } from './middlewares/logger.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// --- CONFIGURATION EJS (Partie Frontend) ---
app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'views'))

// Make icon helper available (Commenté tant que le fichier n'existe pas)
// app.locals.icon = icon 

// Serve static files
app.use(express.static(join(__dirname, 'public')))

// --- INITIALISATION BDD ---
async function initServer() {
    try {
        // Adaptation au modèle E-SPORT
        const tournamentsCount = await prisma.tournament.count()
        const teamsCount = await prisma.team.count()
        const usersCount = await prisma.user.count()
        const registrationsCount = await prisma.registration.count()

        console.log(
            chalk.green(
                `✅ Database connected: ${tournamentsCount} tournaments, ${teamsCount} teams, ${usersCount} users, ${registrationsCount} registrations`
            )
        )
    } catch (error) {
        console.error(chalk.red('❌ Failed to connect to database:'), error.message)
        throw error // Arrête le serveur si la BDD ne répond pas
    }
}

// --- MIDDLEWARES GLOBAUX ---

// 1. Logging (doit être en premier)
app.use(logger)

// 2. Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 3. Session middleware
app.use(
    session({
        secret: env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
)

// 4. User session helper pour les vues
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null
    next()
})

// --- ROUTES ---

// Routes Vues (HTML) - Commentées pour l'instant
// app.use('/auth', viewAuthRoutes)
// app.use('/admin', viewAdminRoutes)
// app.use('/', viewRoutes)

// API routes (Cœur du sujet)
app.use('/api', apiRoutes)

// Swagger UI - Commenté pour l'instant
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// --- GESTION D'ERREURS ---

// 404 handler (après toutes les routes)
app.use(notFound)

// Error handler (doit être le dernier)
app.use(errorHandler)

// --- DÉMARRAGE ---
app.listen(env.PORT, async () => {
    await initServer()
    console.log(chalk.cyan(`\nMode: ${env.NODE_ENV}`))
    console.log(chalk.cyan(`Server started on http://localhost:${env.PORT}\n`))
})