import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'
import { redirect, notFound } from 'next/navigation'
import { getStageConfig } from '@/lib/validators/stage'
import { StepPageContent } from './StepPageContent'
import type { Metadata } from 'next'

type PageProps = { params: Promise<{ step: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { step } = await params
  const config = getStageConfig(parseInt(step))
  return { title: config ? `${config.name} — EV Dealer Onboarding` : 'Onboarding — EV Dealer Hub' }
}

export default async function OnboardingStepPage({ params }: PageProps) {
  const { step } = await params
  const stepNum = parseInt(step)

  if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) notFound()

  const config = getStageConfig(stepNum)
  if (!config) notFound()

  const session = await getSession()
  if (!session) redirect('/login')

  const dealer = await prisma.dealer.findFirst({
    where: { authId: session.sub },
    include: {
      documents: { where: { stage: stepNum } },
      contracts: true,
      staffMembers: true,
      siteData: true,
    },
  })

  if (!dealer) redirect('/register')

  if (dealer.currentStage > 5) redirect('/onboarding/complete')

  const isPreview = stepNum > dealer.currentStage
  const isCompleted = stepNum < dealer.currentStage

  return (
    <StepPageContent
      config={config}
      activeStep={stepNum}
      isCompleted={isCompleted}
      isPreview={isPreview}
      dealer={{
        id: dealer.id,
        currentStage: dealer.currentStage,
        status: dealer.status,
        promoterName: dealer.promoterName,
        entityName: dealer.entityName,
        email: dealer.email,
        documents: dealer.documents.map(d => ({
          id: d.id,
          docType: d.docType,
          stage: d.stage,
          storagePath: d.storagePath ?? undefined,
          verifyStatus: d.verifyStatus as 'pending' | 'verifying' | 'verified' | 'failed',
          uploadedAt: d.uploadedAt.toISOString(),
        })),
        contracts: dealer.contracts.map(c => ({
          id: c.id,
          contractType: c.contractType,
          signStatus: c.signStatus,
          esignRef: c.esignRef ?? undefined,
          signedAt: c.signedAt?.toISOString(),
        })),
        staffMembers: dealer.staffMembers.map(s => ({
          id: s.id,
          name: s.name,
          role: s.role,
          employeeId: s.employeeId,
          certified: s.certified,
          lmsCourses: s.lmsCourses as string[] | null,
        })),
        siteData: dealer.siteData ? {
          lat: dealer.siteData.lat ?? undefined,
          lng: dealer.siteData.lng ?? undefined,
          addressLine: dealer.siteData.addressLine ?? undefined,
          leaseDuration: dealer.siteData.leaseDuration ?? undefined,
          showroomSqft: dealer.siteData.showroomSqft ?? undefined,
          workshopBays: dealer.siteData.workshopBays ?? undefined,
        } : undefined,
      }}
    />
  )
}
