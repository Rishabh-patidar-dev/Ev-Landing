'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Lock, CheckCircle, ExternalLink } from 'lucide-react'
import type { StageConfig } from '@/lib/validators/stage'
import type { VerifyStatus } from '@/lib/store/dealerStore'
import { DocumentUploadZone } from '@/components/onboarding/DocumentUploadZone'
import { StageDetailPanel } from '@/components/onboarding/StageDetailPanel'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const SiteMap = dynamic(() => import('@/components/maps/SiteMap').then(m => m.SiteMap), {
  ssr: false,
  loading: () => <div className="h-72 skeleton rounded-2xl" />,
})

interface StageDealer {
  id: string
  currentStage: number
  status: string
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

interface StagePageContentProps {
  config: StageConfig
  dealer: StageDealer
  isLocked: boolean
  isCompleted: boolean
}

export function StagePageContent({ config, dealer, isLocked, isCompleted }: StagePageContentProps) {
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

  const requiredDocs = config.docs.filter(d => d.required)
  const verifiedCount = requiredDocs.filter(d => docStatuses[d.docType] === 'verified').length
  const allVerified = verifiedCount === requiredDocs.length && dealer.currentStage === config.stage

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
        setAdvanceError(data.error || 'Failed to advance stage')
      } else {
        router.refresh()
        router.push('/dashboard')
      }
    } catch {
      setAdvanceError('Network error')
    } finally {
      setAdvancing(false)
    }
  }

  const handleSign = async (contractId: string) => {
    setSigningId(contractId)
    try {
      // Mock e-sign initiation
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.refresh()
    } finally {
      setSigningId(null)
    }
  }

  if (isLocked) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 p-8 bg-sand/10 rounded-2xl border border-sand/30 text-center justify-center flex-col">
          <Lock className="w-12 h-12 text-sand" />
          <h2 className="text-xl font-bold text-ink">Stage {config.stage} is Locked</h2>
          <p className="text-sand text-sm">Complete Stage {config.stage - 1} first to unlock this stage.</p>
          <Button variant="secondary" onClick={() => router.push(`/stage/${config.stage - 1}`)}>
            Go to Stage {config.stage - 1}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-ink">Stage {config.stage} — {config.name}</h1>
            {isCompleted && <Badge variant="success"><CheckCircle className="w-3 h-3" /> Completed</Badge>}
          </div>
          <p className="text-sand text-sm">{config.description}</p>
        </div>
        {isCompleted && (
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <StageDetailPanel stage={config.stage} verifiedCount={verifiedCount} totalCount={requiredDocs.length} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Document uploads */}
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <div className="space-y-3">
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
                    onStatusChange={(status) => handleStatusChange(doc.docType, status)}
                    onGPSExtracted={config.stage === 3 ? (lat, lng) => setSiteCoords({ lat, lng }) : undefined}
                  />
                )
              })}
            </div>
          </Card>

          {/* Stage 3: Site map */}
          {config.stage === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Site Location</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {siteCoords.lat && siteCoords.lng && (
                  <div className="flex gap-4 text-sm text-sand bg-sand/10 rounded-xl px-4 py-3">
                    <span>Lat: <strong className="text-ink">{siteCoords.lat.toFixed(6)}</strong></span>
                    <span>Lng: <strong className="text-ink">{siteCoords.lng.toFixed(6)}</strong></span>
                  </div>
                )}
                <SiteMap
                  lat={siteCoords.lat}
                  lng={siteCoords.lng}
                  height={300}
                  interactive
                  onLocationSelect={(lat, lng) => setSiteCoords({ lat, lng })}
                />
                {!siteCoords.lat && (
                  <p className="text-xs text-sand text-center">Upload a geo-tagged photo to auto-fill location, or click the map to set it manually.</p>
                )}
              </div>
            </Card>
          )}

          {/* Stage 4: Contracts */}
          {config.stage === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Contracts & E-Signatures</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {dealer.contracts.length === 0 ? (
                  <p className="text-sm text-sand text-center py-4">No contracts issued yet. Our legal team will prepare them after document review.</p>
                ) : (
                  dealer.contracts.map(contract => (
                    <div key={contract.id} className="flex items-center justify-between p-4 bg-sand/10 rounded-xl border border-sand/20">
                      <div>
                        <p className="font-medium text-ink text-sm capitalize">{contract.contractType.replace('_', ' ')}</p>
                        {contract.esignRef && (
                          <p className="text-xs text-sand mt-0.5 font-mono">Ref: {contract.esignRef}</p>
                        )}
                        {contract.signedAt && (
                          <p className="text-xs text-green-600 mt-0.5">Signed on {new Date(contract.signedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={contract.signStatus === 'signed' ? 'success' : contract.signStatus === 'rejected' ? 'error' : 'warning'}>
                          {contract.signStatus}
                        </Badge>
                        {contract.signStatus === 'pending' && (
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
                          <a href={`https://sandbox.leegality.com/sign/${contract.esignRef}`} target="_blank" rel="noopener noreferrer">
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
            </Card>
          )}

          {/* Stage 5: Staff */}
          {config.stage === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Staff Members & LMS</CardTitle>
              </CardHeader>
              <div>
                {dealer.staffMembers.length === 0 ? (
                  <p className="text-sm text-sand text-center py-4">No staff members added yet.</p>
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
                            <td className="py-3 px-3 text-sand capitalize">{staff.role.replace('_', ' ')}</td>
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
            </Card>
          )}

          {/* Advance CTA */}
          {!isCompleted && dealer.currentStage === config.stage && (
            <div className="bg-brand-white border border-sand/30 rounded-2xl p-4">
              {advanceError && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  {advanceError}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-sand">
                  {allVerified ? 'All documents verified — ready to advance!' : `${verifiedCount}/${requiredDocs.length} verified`}
                </p>
                <Button
                  onClick={handleAdvance}
                  disabled={!allVerified || advancing}
                  loading={advancing}
                  variant={allVerified ? 'primary' : 'ghost'}
                >
                  Advance to Stage {config.stage + 1}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
