import chalk from 'chalk'
import { env } from '../config/env.js'

/**
 * Logging middleware
 * Logs HTTP method, URL, status code and response time
 * In development: detailed logs with timestamp, query and body
 * In production: minimal logs (method, URL, status)
 */
export const logger = (req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        const statusColor = res.statusCode >= 400 ? 'red' : 'green'

        if (env.NODE_ENV === 'development') {
            // Logs détaillés en développement
            console.log(chalk.gray(`[${new Date().toISOString()}]`))
            console.log(
                chalk.blue(req.method.padEnd(6)),
                req.url.padEnd(30),
                chalk[statusColor](res.statusCode.toString()),
                chalk.gray(`${duration}ms`)
            )
            if (Object.keys(req.query).length > 0) {
                console.log(chalk.gray('  Query:'), req.query)
            }
        } else {
            // Logs minimaux en production
            console.log(`${req.method} ${req.url} ${res.statusCode}`)
        }
    })

    next()
}
