import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { StatCards } from '@/components/dashboard/StatCards'
import { OEMDashboardContent } from './OEMDashboardContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dealer Pipeline — OEM Admin' }

export default async function OEMDashboard() {
  const session = await getSession()

  if (!session) redirect('/login')
  if (session.role !== 'oem_admin' && session.role !== 'super_admin') redirect('/dashboard')

  // Fetch all dealers with doc counts
  const dealers = await prisma.dealer.findMany({
    include: {
      documents: { select: { id: true, verifyStatus: true } },
      oem: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Compute stats
  const stats = {
    totalDealers: dealers.length,
    byStage: dealers.reduce<Record<string, number>>((acc, d) => {
      const key = `stage_${d.currentStage}`
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {}),
    totalActive: dealers.filter(d => d.status === 'active').length,
    totalPending: dealers.filter(d => d.status === 'pending').length,
    totalLive: dealers.filter(d => d.status === 'live').length,
    recentSignups: dealers.filter(d => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return d.createdAt > weekAgo
    }).length,
    dealersByStage: Object.entries(
      dealers.reduce<Record<number, number>>((acc, d) => {
        acc[d.currentStage] = (acc[d.currentStage] ?? 0) + 1
        return acc
      }, {})
    ).map(([stage, count]) => ({ stage: parseInt(stage), count })),
  }

  const dealerRows = dealers.map(d => ({
    id: d.id,
    entityName: d.entityName,
    gstIn: d.gstIn,
    cityTier: d.cityTier,
    currentStage: d.currentStage,
    status: d.status,
    oemName: d.oem?.name,
    createdAt: d.createdAt.toISOString(),
    docsVerified: d.documents.filter(doc => doc.verifyStatus === 'verified').length,
    docsTotal: d.documents.length,
  }))

  return (
    <div className="p-6 max-w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dealer Pipeline</h1>
        <p className="text-sand text-sm mt-1">Manage and monitor all dealer onboarding applications</p>
      </div>

      <StatCards stats={stats} />

      <OEMDashboardContent dealers={dealerRows} />
    </div>
  )
}
