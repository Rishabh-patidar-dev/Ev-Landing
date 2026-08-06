import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'
import { z } from 'zod'

const rejectSchema = z.object({
  action: z.literal('reject'),
  reason: z.string().min(1, 'Reason is required'),
})

const flagSchema = z.object({
  action: z.literal('flag'),
})

const bodySchema = z.discriminatedUnion('action', [rejectSchema, flagSchema])

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.role !== 'oem_admin' && session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const dealer = await prisma.dealer.findUnique({ where: { id }, select: { id: true, currentStage: true } })
    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    if (parsed.data.action === 'reject') {
      const { reason } = parsed.data

      await prisma.$transaction([
        prisma.dealer.update({
          where: { id },
          data: { status: 'rejected' },
        }),
        prisma.stageTransaction.create({
          data: {
            dealerId: id,
            stage: dealer.currentStage,
            action: 'reject',
            triggeredBy: `admin:${session.sub}`,
            reason,
          },
        }),
      ])

      return NextResponse.json({ success: true, status: 'rejected' })
    }

    if (parsed.data.action === 'flag') {
      await prisma.dealer.update({
        where: { id },
        data: { status: 'flagged' },
      })

      return NextResponse.json({ success: true, status: 'flagged' })
    }
  } catch (error) {
    console.error('[PATCH /api/dealer/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
