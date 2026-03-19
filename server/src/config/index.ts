import 'dotenv/config'
import { t } from 'elysia'

const configSchema = t.Object({
    PORT: t.Numeric({ default: 3001 }),
    NODE_ENV: t.Union([t.Literal('development'), t.Literal('production'), t.Literal('test')], { default: 'development' }),
    DATABASE_URL: t.String(),
    JWT_SECRET: t.String(),
    FRONTEND_URL: t.String({ default: 'http://localhost:3000' })
})

const _config = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
}

if (!_config.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in .env file");
}

export const config = {
    server: {
        port: Number(_config.PORT) || 3001,
        env: _config.NODE_ENV || 'development',
        isDev: _config.NODE_ENV === 'development',
    },
    database: {
        url: _config.DATABASE_URL,
    },
    auth: {
        secret: _config.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
    },
    cors: {
        origin: _config.FRONTEND_URL,
    }
} as const;