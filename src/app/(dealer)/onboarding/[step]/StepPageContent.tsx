'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Zap, LogOut, CheckCircle, ExternalLink,
  ChevronLeft, ChevronRight, Clock, Building2, IndianRupee, Eye,
} from 'lucide-react'
import type { StageConfig } from '@/lib/validators/stage'
import { STAGE_CONFIGS } from '@/lib/validators/stage'
import type { VerifyStatus } from '@/lib/store/dealerStore'
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper'
import { DocumentUploadZone } from '@/components/onboarding/DocumentUploadZone'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const SiteMap = dynamic(() => import('@/components/maps/SiteMap').then(m => m.SiteMap), {
  ssr: false,
  loading: () => <div className="h-72 rounded-2xl bg-sand/10 animate-pulse" />,
})

interface StepDealer {
  id: string
  currentStage: number
  status: string
  promoterName: string
  entityName: string
  email: string
  documents: Array<{
    id: string
    docType: string
    stage: number
    storagePath?: string
    verifyStatus: VerifyStatus
    uploadedAt: string
  }>
  contracts: Array<{
    id: string
    contractType: string
    signStatus: string
    esignRef?: string
    signedAt?: string
  }>
  staffMembers: Array<{
    id: string
    name: string
    role: string
    employeeId: string
    certified: boolean
    lmsCourses: string[] | null
  }>
  siteData?: {
    lat?: number
    lng?: number
    addressLine?: string
    leaseDuration?: number
    showroomSqft?: number
    workshopBays?: number
  }
}

interface StepPageContentProps {
  config: StageConfig
  dealer: StepDealer
  activeStep: number
  isCompleted: boolean
  isPreview: boolean
}

export function StepPageContent({ config, dealer, activeStep, isCompleted, isPreview }: StepPageContentProps) {
  const router = useRouter()

  const [docStatuses, setDocStatuses] = useState<Record<string, VerifyStatus>>(
    Object.fromEntries(dealer.documents.map(d => [d.docType, d.verifyStatus]))
  )
  const [siteCoords, setSiteCoords] = useState<{ lat?: number; lng?: number }>({
    lat: dealer.siteData?.lat,
    lng: dealer.siteData?.lng,
  })
  const [advancing, setAdvancing] = useState(false)
  const [advanceError, setAdvanceError] = useState<string | null>(null)
  const [signingId, setSigningId] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  const requiredDocs = config.docs.filter(d => d.required)
  const verifiedCount = requiredDocs.filter(d => docStatuses[d.docType] === 'verified').length
  const allVerified = !isCompleted && verifiedCount === requiredDocs.length

  const prevConfig = STAGE_CONFIGS[activeStep - 2]
  const nextConfig = STAGE_CONFIGS[activeStep]

  const handleStatusChange = (docType: string, status: VerifyStatus) => {
    setDocStatuses(prev => ({ ...prev, [docType]: status }))
  }

  const handleAdvance = async () => {
    setAdvancing(true)
    setAdvanceError(null)
    try {
      const res = await fetch('/api/stage/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId: dealer.id, targetStage: config.stage + 1 }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAdvanceError(data.error ?? 'Failed to advance stage')
      } else {
        router.push(config.stage === 5 ? '/onboarding/complete' : `/onboarding/${config.stage + 1}`)
      }
    } catch {
      setAdvanceError('Network error. Please try again.')
    } finally {
      setAdvancing(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleSign = async (contractId: string) => {
    setSigningId(contractId)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.refresh()
    } finally {
      setSigningId(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[--white]">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-ink border-b border-ink2">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-ink" />
            </div>
            <div>
              <p className="text-brand-white text-sm font-semibold leading-tight">EV Dealer Onboarding</p>
              <p className="text-sand/50 text-xs mt-0.5 leading-tight hidden sm:block">{dealer.entityName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-brand-white text-xs font-medium leading-tight">{dealer.promoterName}</p>
              <p className="text-sand/50 text-xs leading-tight">{dealer.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sand/60 hover:text-brand-white hover:bg-white/10 transition-colors text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{signingOut ? 'Signing out…' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Stepper ─────────────────────────────────────────────── */}
      <OnboardingStepper currentStage={dealer.currentStage} activeStep={activeStep} />

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">

          {/* Stage header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-sand/50 uppercase tracking-wider">
                Step {activeStep} of 5
              </span>
              {isCompleted && (
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed — Read only
                </Badge>
              )}
              {isPreview && (
                <Badge variant="info">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-ink">{config.name}</h1>
            <p className="text-sand">{config.description}</p>
          </div>

          {/* Preview banner */}
          {isPreview && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <Eye className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Preview mode</strong> — you can see what's required here, but uploads are locked until you complete{' '}
                <a href={`/onboarding/${activeStep - 1}`} className="underline hover:text-amber-900">
                  Stage {activeStep - 1}
                </a>{' '}
                first.
              </p>
            </div>
          )}

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { Icon: Building2, label: 'Department', value: config.dept },
                { Icon: Clock, label: 'Timeline', value: config.estimatedDays },
                { Icon: IndianRupee, label: 'Cost', value: config.costRange },
              ] as const
            ).map(({ Icon, label, value }) => (
              <div key={label} className="bg-brand-white border border-sand/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-slate flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-sand/60 uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>

          {/* Documents section */}
          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-sm font-semibold text-sand/60 uppercase tracking-wider">Documents</h2>
              <span className="text-sm text-slate font-medium">
                {verifiedCount} / {requiredDocs.length} verified
              </span>
              {/* Progress bar */}
              <div className="flex-1 h-1 bg-sand/20 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-slate rounded-full transition-all duration-500"
                  style={{ width: requiredDocs.length > 0 ? `${(verifiedCount / requiredDocs.length) * 100}%` : '0%' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.docs.map(doc => {
                const uploaded = dealer.documents.find(d => d.docType === doc.docType)
                return (
                  <DocumentUploadZone
                    key={doc.docType}
                    docType={doc.docType}
                    label={doc.label}
                    hint={doc.hint}
                    stage={config.stage}
                    dealerId={dealer.id}
                    verifyApi={doc.verifyApi}
                    accept={doc.accept}
                    currentStatus={docStatuses[doc.docType] ?? 'pending'}
                    storagePath={uploaded?.storagePath}
                    readOnly={isCompleted || isPreview}
                    onStatusChange={isCompleted || isPreview ? undefined : (status) => handleStatusChange(doc.docType, status)}
                    onGPSExtracted={
                      config.stage === 3 && !isCompleted && !isPreview
                        ? (lat, lng) => setSiteCoords({ lat, lng })
                        : undefined
                    }
                  />
                )
              })}
            </div>
          </div>

          {/* Stage 3 — Site map */}
          {config.stage === 3 && (
            <div className="bg-brand-white border border-sand/20 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-ink">Site Location</h2>
              {siteCoords.lat && siteCoords.lng && (
                <div className="flex gap-6 text-sm text-sand bg-sand/10 rounded-xl px-4 py-3">
                  <span>Lat: <strong className="text-ink">{siteCoords.lat.toFixed(6)}</strong></span>
                  <span>Lng: <strong className="text-ink">{siteCoords.lng.toFixed(6)}</strong></span>
                </div>
              )}
              <SiteMap
                lat={siteCoords.lat}
                lng={siteCoords.lng}
                height={300}
                interactive={!isCompleted && !isPreview}
                onLocationSelect={!isCompleted && !isPreview ? (lat, lng) => setSiteCoords({ lat, lng }) : undefined}
              />
              {!siteCoords.lat && !isCompleted && !isPreview && (
                <p className="text-xs text-sand text-center">
                  Upload a geo-tagged photo to auto-fill location, or click the map to set it manually.
                </p>
              )}
            </div>
          )}

          {/* Stage 4 — Contracts */}
          {config.stage === 4 && (
            <div className="bg-brand-white border border-sand/20 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-ink">Contracts & E-Signatures</h2>
              {dealer.contracts.length === 0 ? (
                <p className="text-sm text-sand text-center py-6">
                  No contracts issued yet. Our legal team will prepare them after document review.
                </p>
              ) : (
                dealer.contracts.map(contract => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 bg-sand/5 rounded-xl border border-sand/20"
                  >
                    <div>
                      <p className="font-medium text-ink text-sm capitalize">
                        {contract.contractType.replace(/_/g, ' ')}
                      </p>
                      {contract.esignRef && (
                        <p className="text-xs text-sand mt-0.5 font-mono">Ref: {contract.esignRef}</p>
                      )}
                      {contract.signedAt && (
                        <p className="text-xs text-green-600 mt-0.5">
                          Signed on {new Date(contract.signedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          contract.signStatus === 'signed'
                            ? 'success'
                            : contract.signStatus === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {contract.signStatus}
                      </Badge>
                      {contract.signStatus === 'pending' && !isCompleted && !isPreview && (
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={signingId === contract.id}
                          onClick={() => handleSign(contract.id)}
                        >
                          Sign via Aadhaar OTP
                        </Button>
                      )}
                      {contract.esignRef && (
                        <a
                          href={`https://sandbox.leegality.com/sign/${contract.esignRef}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3" /> Open
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Stage 5 — Staff & LMS */}
          {config.stage === 5 && (
            <div className="bg-brand-white border border-sand/20 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-ink mb-4">Staff Members & LMS</h2>
              {dealer.staffMembers.length === 0 ? (
                <p className="text-sm text-sand text-center py-6">No staff members added yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-sand uppercase border-b border-sand/20">
                      <tr>
                        <th className="py-2 px-3 text-left">Name</th>
                        <th className="py-2 px-3 text-left">Role</th>
                        <th className="py-2 px-3 text-left">Employee ID</th>
                        <th className="py-2 px-3 text-left">LMS Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand/10">
                      {dealer.staffMembers.map(staff => (
                        <tr key={staff.id}>
                          <td className="py-3 px-3 font-medium text-ink">{staff.name}</td>
                          <td className="py-3 px-3 text-sand capitalize">
                            {staff.role.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-sand">{staff.employeeId}</td>
                          <td className="py-3 px-3">
                            <Badge variant={staff.certified ? 'success' : 'warning'}>
                              {staff.certified ? 'Certified' : 'In Progress'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── Navigation footer ───────────────────────────────────── */}
      <footer className="sticky bottom-0 z-40 bg-brand-white border-t border-sand/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          {/* Previous */}
          {prevConfig ? (
            <Link
              href={`/onboarding/${activeStep - 1}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-sand hover:text-ink border border-sand/30 rounded-xl hover:border-sand/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{prevConfig.name}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          ) : (
            <div />
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {advanceError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 max-w-xs">
                {advanceError}
              </p>
            )}

            {isPreview ? (
              /* Previewing a future stage — no CTA, just navigate */
              null
            ) : isCompleted ? (
              /* Viewing a completed stage — just navigate forward */
              activeStep < 5 ? (
                <Link
                  href={`/onboarding/${activeStep + 1}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-ink text-brand-white rounded-xl hover:bg-ink2 transition-colors"
                >
                  <span className="hidden sm:inline">{nextConfig?.name}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : dealer.currentStage > 5 ? (
                <Link
                  href="/onboarding/complete"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-slate text-brand-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  View Submission <ChevronRight className="w-4 h-4" />
                </Link>
              ) : null
            ) : (
              /* Current active stage — submit to advance */
              <div className="flex items-center gap-3">
                <p className="text-xs text-sand hidden sm:block">
                  {allVerified
                    ? 'All required documents verified'
                    : `${verifiedCount} of ${requiredDocs.length} verified`}
                </p>
                <Button
                  onClick={handleAdvance}
                  disabled={!allVerified || advancing}
                  loading={advancing}
                  variant={allVerified ? 'primary' : 'ghost'}
                >
                  {config.stage === 5 ? 'Submit Application' : 'Complete Stage'}
                  {!advancing && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            )}
          </div>

        </div>
      </footer>

    </div>
  )
}
