import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? ''
  // @prisma/adapter-pg does NOT parse `?schema=` out of the connection
  // string (that's a Prisma-CLI-only convention) — it needs the schema
  // passed explicitly, or every query silently falls back to the
  // connection's default `public` schema. That schema is the CRM's; this
  // app's Dealer/Document/Account tables live in `dealer_portal`.
  const adapter = new PrismaPg({ connectionString }, { schema: 'dealer_portal' })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
