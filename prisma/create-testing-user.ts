// Upserts the "Testing / Testing@123" demo account for the landing page.
// Direct-to-Postgres now (Account model + bcrypt) — no Supabase, no
// external keys, safe to re-run against a live database (touches only the
// one row it owns).
import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local', override: true })
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }, { schema: 'dealer_portal' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const username = 'Testing'
  const password = 'Testing@123'
  const passwordHash = await bcrypt.hash(password, 10)

  const account = await prisma.account.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash, fullName: 'Testing User', role: 'dealer' },
  })

  console.log(`Account ready: username="${account.username}" role=${account.role}`)
  console.log('\nSign in at /login with:')
  console.log(`  Username: ${username}`)
  console.log(`  Password: ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
