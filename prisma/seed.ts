import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }, { schema: 'dealer_portal' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database…')

  // OEMs
  const [atherOem, olaOem, tvsoem] = await Promise.all([
    prisma.oEM.create({
      data: { name: 'Ather Energy', minNetWorth: 5000000, franchiseFee: 500000, deposit: 1000000 },
    }),
    prisma.oEM.create({
      data: { name: 'Ola Electric', minNetWorth: 8000000, franchiseFee: 750000, deposit: 1500000 },
    }),
    prisma.oEM.create({
      data: { name: 'TVS Motor', minNetWorth: 10000000, franchiseFee: 1000000, deposit: 2000000 },
    }),
  ])
  console.log('✓ OEMs created')

  // Dealers
  const dealers = await Promise.all([
    // Stage 1 - freshly applied
    prisma.dealer.create({
      data: {
        gstIn: '27AABCT3518Q1ZV',
        pan: 'AABCT3518Q',
        entityName: 'Sunrise EV Solutions Pvt Ltd',
        promoterName: 'Rahul Sharma',
        email: 'rahul@sunriseev.in',
        mobile: '9876543210',
        cityTier: 'Tier 1 — Mumbai',
        oemId: atherOem.id,
        currentStage: 1,
        status: 'pending',
        leadScore: 72,
      },
    }),
    // Stage 2 - KYC done
    prisma.dealer.create({
      data: {
        gstIn: '29AADCS5554Q1ZT',
        pan: 'AADCS5554Q',
        entityName: 'GreenDrive Automotive LLP',
        promoterName: 'Priya Nair',
        email: 'priya@greendrive.in',
        mobile: '9845021345',
        cityTier: 'Tier 1 — Bengaluru',
        oemId: olaOem.id,
        currentStage: 2,
        status: 'active',
        leadScore: 85,
      },
    }),
    // Stage 3 - Finance done
    prisma.dealer.create({
      data: {
        gstIn: '24AAACR5055K1ZA',
        pan: 'AAACR5055K',
        entityName: 'Rajpath Motors Pvt Ltd',
        promoterName: 'Vikram Patel',
        email: 'vikram@rajpathmotors.in',
        mobile: '9712304567',
        cityTier: 'Tier 2 — Surat',
        oemId: tvsoem.id,
        currentStage: 3,
        status: 'active',
        leadScore: 91,
      },
    }),
    // Stage 4 - Site done
    prisma.dealer.create({
      data: {
        gstIn: '36AAECS5019Q1ZT',
        pan: 'AAECS5019Q',
        entityName: 'Deccan EV Hub Pvt Ltd',
        promoterName: 'Anitha Reddy',
        email: 'anitha@deccanev.in',
        mobile: '9848012345',
        cityTier: 'Tier 1 — Hyderabad',
        oemId: atherOem.id,
        currentStage: 4,
        status: 'active',
        leadScore: 88,
      },
    }),
    // Stage 5 - Contracts done
    prisma.dealer.create({
      data: {
        gstIn: '07AAACN0082H1ZP',
        pan: 'AAACN0082H',
        entityName: 'Capital EV Enterprises',
        promoterName: 'Suresh Kumar',
        email: 'suresh@capitalev.in',
        mobile: '9810023456',
        cityTier: 'Tier 1 — Delhi',
        oemId: olaOem.id,
        currentStage: 5,
        status: 'active',
        leadScore: 94,
      },
    }),
    // Stage 6 - Live
    prisma.dealer.create({
      data: {
        gstIn: '33AABCP6789L1ZM',
        pan: 'AABCP6789L',
        entityName: 'PearlCity EV World Pvt Ltd',
        promoterName: 'Karthik Subramanian',
        email: 'karthik@pearlcityev.in',
        mobile: '9944012345',
        cityTier: 'Tier 1 — Chennai',
        oemId: tvsoem.id,
        currentStage: 6,
        status: 'live',
        leadScore: 97,
      },
    }),
    // Two more at stage 1 for volume
    prisma.dealer.create({
      data: {
        gstIn: '08AABCM4255H1ZR',
        pan: 'AABCM4255H',
        entityName: 'Pink City Motors LLP',
        promoterName: 'Deepak Mehta',
        email: 'deepak@pinkcitymotors.in',
        mobile: '9829045678',
        cityTier: 'Tier 2 — Jaipur',
        oemId: atherOem.id,
        currentStage: 1,
        status: 'pending',
        leadScore: 65,
      },
    }),
    prisma.dealer.create({
      data: {
        gstIn: '19AADCP5432Q1ZU',
        pan: 'AADCP5432Q',
        entityName: 'Eastern EV Point Pvt Ltd',
        promoterName: 'Sanjay Banerjee',
        email: 'sanjay@easternev.in',
        mobile: '9830034567',
        cityTier: 'Tier 1 — Kolkata',
        oemId: olaOem.id,
        currentStage: 2,
        status: 'active',
        leadScore: 78,
      },
    }),
  ])
  console.log(`✓ ${dealers.length} dealers created`)

  // Stage history for each dealer
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

  const stageHistoryData = [
    // Sunrise (stage 1) — just applied
    { dealerIdx: 0, stage: 1, action: 'enter', triggeredBy: 'system', createdAt: daysAgo(3) },

    // GreenDrive (stage 2) — advanced from 1
    { dealerIdx: 1, stage: 1, action: 'enter', triggeredBy: 'system', createdAt: daysAgo(14) },
    { dealerIdx: 1, stage: 2, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(9) },

    // Rajpath (stage 3)
    { dealerIdx: 2, stage: 1, action: 'enter', triggeredBy: 'system', createdAt: daysAgo(28) },
    { dealerIdx: 2, stage: 2, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(22) },
    { dealerIdx: 2, stage: 3, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(14) },

    // Deccan (stage 4)
    { dealerIdx: 3, stage: 1, action: 'enter', triggeredBy: 'system', createdAt: daysAgo(45) },
    { dealerIdx: 3, stage: 2, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(38) },
    { dealerIdx: 3, stage: 3, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(28) },
    { dealerIdx: 3, stage: 4, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(14) },

    // Capital (stage 5)
    { dealerIdx: 4, stage: 1, action: 'enter', triggeredBy: 'system', createdAt: daysAgo(60) },
    { dealerIdx: 4, stage: 2, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(52) },
    { dealerIdx: 4, stage: 3, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(40) },
    { dealerIdx: 4, stage: 4, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(28) },
    { dealerIdx: 4, stage: 5, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(10) },

    // PearlCity (live)
    { dealerIdx: 5, stage: 1, action: 'enter', triggeredBy: 'system', createdAt: daysAgo(90) },
    { dealerIdx: 5, stage: 2, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(80) },
    { dealerIdx: 5, stage: 3, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(65) },
    { dealerIdx: 5, stage: 4, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(50) },
    { dealerIdx: 5, stage: 5, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(30) },
    { dealerIdx: 5, stage: 6, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(7) },

    // Pink City (stage 1)
    { dealerIdx: 6, stage: 1, action: 'enter', triggeredBy: 'system', createdAt: daysAgo(5) },

    // Eastern (stage 2)
    { dealerIdx: 7, stage: 1, action: 'enter', triggeredBy: 'system', createdAt: daysAgo(20) },
    { dealerIdx: 7, stage: 2, action: 'advance', triggeredBy: 'oem_admin', createdAt: daysAgo(12) },
  ]

  await prisma.stageTransaction.createMany({
    data: stageHistoryData.map(({ dealerIdx, stage, action, triggeredBy, createdAt }) => ({
      dealerId: dealers[dealerIdx].id,
      stage,
      action,
      triggeredBy,
      createdAt: new Date(createdAt),
    })),
  })
  console.log('✓ Stage history created')

  // Documents for a few dealers
  const docData = [
    // GreenDrive - stage 1 docs all verified
    { dealerIdx: 1, stage: 1, docType: 'aadhaar', verifyStatus: 'verified' },
    { dealerIdx: 1, stage: 1, docType: 'pan', verifyStatus: 'verified' },
    { dealerIdx: 1, stage: 1, docType: 'gstin', verifyStatus: 'verified' },
    { dealerIdx: 1, stage: 1, docType: 'incorporation', verifyStatus: 'verified' },

    // Rajpath - stages 1 & 2 verified
    { dealerIdx: 2, stage: 1, docType: 'aadhaar', verifyStatus: 'verified' },
    { dealerIdx: 2, stage: 1, docType: 'pan', verifyStatus: 'verified' },
    { dealerIdx: 2, stage: 1, docType: 'gstin', verifyStatus: 'verified' },
    { dealerIdx: 2, stage: 1, docType: 'incorporation', verifyStatus: 'verified' },
    { dealerIdx: 2, stage: 2, docType: 'balance_sheet', verifyStatus: 'verified' },
    { dealerIdx: 2, stage: 2, docType: 'itr', verifyStatus: 'verified' },
    { dealerIdx: 2, stage: 2, docType: 'bank_stmt', verifyStatus: 'verified' },
    { dealerIdx: 2, stage: 2, docType: 'net_worth', verifyStatus: 'verified' },
    { dealerIdx: 2, stage: 2, docType: 'cancelled_cheque', verifyStatus: 'verified' },

    // Deccan - stages 1-3 verified
    { dealerIdx: 3, stage: 1, docType: 'aadhaar', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 1, docType: 'pan', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 1, docType: 'gstin', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 1, docType: 'incorporation', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 2, docType: 'balance_sheet', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 2, docType: 'itr', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 2, docType: 'bank_stmt', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 2, docType: 'net_worth', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 2, docType: 'cancelled_cheque', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 3, docType: 'lease', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 3, docType: 'floor_plan', verifyStatus: 'verified' },
    { dealerIdx: 3, stage: 3, docType: 'geo_photo', verifyStatus: 'verified' },

    // Sunrise - stage 1 partial
    { dealerIdx: 0, stage: 1, docType: 'aadhaar', verifyStatus: 'pending' },
    { dealerIdx: 0, stage: 1, docType: 'pan', verifyStatus: 'pending' },
  ]

  await prisma.document.createMany({
    data: docData.map(({ dealerIdx, stage, docType, verifyStatus }) => ({
      dealerId: dealers[dealerIdx].id,
      stage,
      docType,
      verifyStatus,
    })),
  })
  console.log('✓ Documents created')

  // Site assessment for Deccan (stage 4)
  await prisma.siteAssessment.create({
    data: {
      dealerId: dealers[3].id,
      lat: 17.3850,
      lng: 78.4867,
      addressLine: 'Plot 42, Hi-Tech City, Madhapur, Hyderabad — 500081',
      leaseDuration: 60,
      showroomSqft: 3200,
      workshopBays: 6,
      oemApproved: true,
    },
  })
  console.log('✓ Site assessment created')

  // Contracts for Capital (stage 5)
  await prisma.contract.createMany({
    data: [
      { dealerId: dealers[4].id, contractType: 'loi', signStatus: 'signed', franchiseFee: 750000, deposit: 1500000 },
      { dealerId: dealers[4].id, contractType: 'dealer_agreement', signStatus: 'signed' },
      { dealerId: dealers[4].id, contractType: 'nda', signStatus: 'signed' },
    ],
  })
  console.log('✓ Contracts created')

  // Staff for PearlCity (live)
  await prisma.staffMember.createMany({
    data: [
      { dealerId: dealers[5].id, name: 'Murugan R.', role: 'Sales Manager', employeeId: 'EMP001', certified: true, lmsCourses: ['ev-basics', 'sales-101', 'safety'] },
      { dealerId: dealers[5].id, name: 'Lakshmi D.', role: 'Service Technician', employeeId: 'EMP002', certified: true, lmsCourses: ['ev-basics', 'service-tech', 'safety'] },
      { dealerId: dealers[5].id, name: 'Arjun P.', role: 'Finance Executive', employeeId: 'EMP003', certified: true, lmsCourses: ['ev-basics', 'finance-101'] },
    ],
  })
  console.log('✓ Staff members created')

  console.log('\nSeed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
