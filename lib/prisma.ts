import { PrismaClient } from '../app/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Version key changes whenever the schema changes, forcing a fresh client in dev.
const CACHE_KEY = '__prisma_v3__'

const globalForPrisma = global as unknown as {
    [CACHE_KEY]: PrismaClient | undefined
}

function createPrismaClient() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

const prisma = globalForPrisma[CACHE_KEY] ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma[CACHE_KEY] = prisma

export default prisma
