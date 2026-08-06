import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma/client'
import { validateGSTIN } from '@/lib/validators/gstin'
import { validatePAN } from '@/lib/validators/pan'
import { verifyGSTIN } from '@/lib/apis/gstin'

const leadSchema = z.object({
  gstin: z.string().refine(validateGSTIN, 'Invalid GSTIN'),
  pan: z.string().refine(validatePAN, 'Invalid PAN'),
  entityName: z.string().min(2),
  promoterName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  cityTier: z.string().min(1),
  oemId: z.string().optional(),
  netWorthRange: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check for duplicate
    const existing = await prisma.dealer.findFirst({
      where: { OR: [{ gstIn: data.gstin }, { email: data.email }] },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A dealer with this GSTIN or email already exists.' },
        { status: 409 }
      )
    }

    // Create a login identity linked to this dealer. No password yet — this
    // form doesn't collect one (previously: Supabase + forgot-password).
    // The dealer can't sign in until support sets a password, or they use
    // the newer /signup + /apply flow instead.
    let authId: string | null = null
    try {
      const account = await prisma.account.create({
        data: { username: data.email, fullName: data.promoterName, role: 'dealer' },
      })
      authId = account.id
    } catch (err) {
      console.error('[POST /api/leads] Account creation failed:', err)
      // Don't block lead capture — create dealer without authId, admin can link later
    }

    // Create dealer record
    const dealer = await prisma.dealer.create({
      data: {
        gstIn: data.gstin,
        pan: data.pan,
        entityName: data.entityName,
        promoterName: data.promoterName,
        email: data.email,
        mobile: data.mobile,
        cityTier: data.cityTier,
        oemId: data.oemId ?? null,
        netWorthRange: data.netWorthRange ?? null,
        authId,
        currentStage: 1,
        status: 'pending',
        stageHistory: {
          create: {
            stage: 1,
            action: 'enter',
            triggeredBy: 'system',
          },
        },
      },
    })

    // Fire GSTIN verification async
    verifyGSTIN(data.gstin).then(async (result) => {
      await prisma.document.create({
        data: {
          dealerId: dealer.id,
          stage: 1,
          docType: 'gstin',
          verifyApi: 'whitebooks',
          verifyStatus: result.verifyStatus,
          verifyPayload: result.payload as object,
        },
      })
    }).catch(console.error)

    return NextResponse.json(
      {
        dealerId: dealer.id,
        message: 'Application submitted successfully. Our team will follow up to set up your account.',
        authCreated: !!authId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/leads]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
