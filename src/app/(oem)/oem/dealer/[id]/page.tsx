import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'
import { redirect, notFound } from 'next/navigation'
import { DealerDetailContent } from './DealerDetailContent'
import type { Metadata } from 'next'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const dealer = await prisma.dealer.findUnique({ where: { id }, select: { entityName: true } })
  return { title: dealer ? `${dealer.entityName} — OEM Admin` : 'Dealer Detail' }
}

export default async function DealerDetailPage({ params }: PageProps) {
  const { id } = await params

  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'oem_admin' && session.role !== 'super_admin') redirect('/dashboard')

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: {
      documents: { orderBy: { uploadedAt: 'desc' } },
      stageHistory: { orderBy: { createdAt: 'desc' } },
      siteData: true,
      contracts: true,
      staffMembers: true,
      oem: true,
    },
  })

  if (!dealer) notFound()

  return (
    <DealerDetailContent
      dealer={{
        id: dealer.id,
        entityName: dealer.entityName,
        promoterName: dealer.promoterName,
        email: dealer.email,
        mobile: dealer.mobile,
        gstIn: dealer.gstIn,
        pan: dealer.pan,
        cityTier: dealer.cityTier,
        currentStage: dealer.currentStage,
        status: dealer.status,
        netWorthRange: dealer.netWorthRange ?? undefined,
        createdAt: dealer.createdAt.toISOString(),
        oemName: dealer.oem?.name,
        documents: dealer.documents.map(d => ({
          id: d.id,
          docType: d.docType,
          stage: d.stage,
          storagePath: d.storagePath ?? undefined,
          verifyStatus: d.verifyStatus,
          verifyApi: d.verifyApi ?? undefined,
          verifyPayload: d.verifyPayload as Record<string, unknown> | null,
          uploadedAt: d.uploadedAt.toISOString(),
        })),
        stageHistory: dealer.stageHistory.map(h => ({
          id: h.id,
          stage: h.stage,
          action: h.action,
          triggeredBy: h.triggeredBy,
          reason: h.reason ?? undefined,
          createdAt: h.createdAt.toISOString(),
        })),
        siteData: dealer.siteData ? {
          lat: dealer.siteData.lat ?? undefined,
          lng: dealer.siteData.lng ?? undefined,
          addressLine: dealer.siteData.addressLine ?? undefined,
          showroomSqft: dealer.siteData.showroomSqft ?? undefined,
          workshopBays: dealer.siteData.workshopBays ?? undefined,
          leaseDuration: dealer.siteData.leaseDuration ?? undefined,
          oemApproved: dealer.siteData.oemApproved,
        } : undefined,
        contracts: dealer.contracts.map(c => ({
          id: c.id,
          contractType: c.contractType,
          signStatus: c.signStatus,
          esignRef: c.esignRef ?? undefined,
          signedAt: c.signedAt?.toISOString(),
          franchiseFee: c.franchiseFee ?? undefined,
          deposit: c.deposit ?? undefined,
        })),
        staffMembers: dealer.staffMembers.map(s => ({
          id: s.id,
          name: s.name,
          role: s.role,
          employeeId: s.employeeId,
          certified: s.certified,
        })),
      }}
    />
  )
}
