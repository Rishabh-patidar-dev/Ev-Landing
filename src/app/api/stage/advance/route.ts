import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'
import { getRequiredDocs } from '@/lib/validators/stage'
import { z } from 'zod'

const advanceSchema = z.object({
  dealerId: z.string().uuid(),
  targetStage: z.number().int().min(2).max(6),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = advanceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { dealerId, targetStage } = parsed.data
    const isAdmin = session.role === 'oem_admin' || session.role === 'super_admin'

    const result = await prisma.$transaction(async (tx) => {
      const dealer = await tx.dealer.findFirst({
        where: isAdmin ? { id: dealerId } : { id: dealerId, authId: session.sub },
        include: { documents: { where: { stage: targetStage - 1 } } },
      })

      if (!dealer) {
        throw new Error('ACCESS_DENIED')
      }

      if (dealer.currentStage !== targetStage - 1) {
        throw new Error(`WRONG_STAGE:Current stage is ${dealer.currentStage}, cannot advance to ${targetStage}`)
      }

      // Verify all required docs for the current stage are verified
      const requiredDocs = getRequiredDocs(dealer.currentStage)
      const missingOrUnverified = requiredDocs.filter(req => {
        const doc = dealer.documents.find(d => d.docType === req.docType)
        return !doc || doc.verifyStatus !== 'verified'
      })

      if (missingOrUnverified.length > 0) {
        const labels = missingOrUnverified.map(d => d.label).join(', ')
        throw new Error(`DOCS_INCOMPLETE:${labels}`)
      }

      const [updatedDealer, stageTransaction] = await Promise.all([
        tx.dealer.update({
          where: { id: dealerId },
          data: { currentStage: targetStage },
        }),
        tx.stageTransaction.create({
          data: {
            dealerId,
            stage: targetStage,
            action: 'enter',
            triggeredBy: isAdmin ? `admin:${session.sub}` : 'dealer',
          },
        }),
      ])

      return { dealer: updatedDealer, transaction: stageTransaction }
    })

    return NextResponse.json({
      success: true,
      currentStage: result.dealer.currentStage,
      transactionId: result.transaction.id,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ACCESS_DENIED') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
      if (error.message.startsWith('WRONG_STAGE:')) {
        return NextResponse.json({ error: error.message.slice(12) }, { status: 400 })
      }
      if (error.message.startsWith('DOCS_INCOMPLETE:')) {
        return NextResponse.json(
          { error: 'Required documents not yet verified', missing: error.message.slice(16) },
          { status: 422 }
        )
      }
    }
    console.error('[POST /api/stage/advance]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
