import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET doit avoir au moins 32 caractères'), // <-- Attention à ça !
  JWT_EXPIRES_IN: z.string().default('24h'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Configuration invalide :')
  console.error(parsed.error.issues)
  throw new Error("Variables d'environnement invalides")
}

export const env = parsed.data