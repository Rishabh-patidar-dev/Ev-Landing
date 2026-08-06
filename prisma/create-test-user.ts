// Creates a login (Account) for the seeded "GreenDrive Automotive LLP"
// dealer (stage 2, active — good for testing the mid-pipeline dashboard).
// Direct-to-Postgres now — no Supabase.
import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local', override: true })
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }, { schema: 'dealer_portal' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const username = 'dealer_test'
  const password = 'Test@1234'

  const passwordHash = await bcrypt.hash(password, 10)
  const account = await prisma.account.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash, fullName: 'GreenDrive Test Dealer', role: 'dealer' },
  })
  console.log(`✓ Account: ${username} (id: ${account.id})`)

  const dealer = await prisma.dealer.update({
    where: { gstIn: '29AADCS5554Q1ZT' },
    data: { authId: account.id },
  })
  console.log(`✓ Linked to dealer: ${dealer.entityName}`)
  console.log('\nTest credentials:')
  console.log(`  Username: ${username}`)
  console.log(`  Password: ${password}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
