import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.role !== 'oem_admin' && session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [dealers, stageCounts] = await Promise.all([
      prisma.dealer.findMany({ select: { status: true, createdAt: true } }),
      prisma.dealer.groupBy({ by: ['currentStage'], _count: { id: true } }),
    ])

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    return NextResponse.json({
      totalDealers: dealers.length,
      totalActive: dealers.filter(d => d.status === 'active').length,
      totalPending: dealers.filter(d => d.status === 'pending').length,
      totalLive: dealers.filter(d => d.status === 'live').length,
      recentSignups: dealers.filter(d => d.createdAt > weekAgo).length,
      byStage: stageCounts.reduce<Record<string, number>>((acc, row) => {
        acc[`stage_${row.currentStage}`] = row._count.id
        return acc
      }, {}),
      dealersByStage: stageCounts.map(row => ({
        stage: row.currentStage,
        count: row._count.id,
      })),
    })
  } catch (error) {
    console.error('[GET /api/dashboard/stats]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
