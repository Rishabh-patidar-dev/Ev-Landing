'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, CheckCircle, XCircle, Flag, Clock, User, Mail, Phone, Building2, FileText, ExternalLink } from 'lucide-react'
import { StagePipeline } from '@/components/onboarding/StagePipeline'
import { VerificationBadge } from '@/components/onboarding/VerificationBadge'
import { StageBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { STAGE_CONFIGS } from '@/lib/validators/stage'
import { formatDistanceToNow } from 'date-fns'

const SiteMap = dynamic(() => import('@/components/maps/SiteMap').then(m => m.SiteMap), {
  ssr: false,
  loading: () => <div className="h-64 skeleton rounded-2xl" />,
})

interface DealerDetail {
  id: string
  entityName: string
  promoterName: string
  email: string
  mobile: string
  gstIn: string
  pan: string
  cityTier: string
  currentStage: number
  status: string
  netWorthRange?: string
  createdAt: string
  oemName?: string
  documents: Array<{
    id: string
    docType: string
    stage: number
    storagePath?: string
    verifyStatus: string
    verifyApi?: string
    verifyPayload: Record<string, unknown> | null
    uploadedAt: string
  }>
  stageHistory: Array<{
    id: string
    stage: number
    action: string
    triggeredBy: string
    reason?: string
    createdAt: string
  }>
  siteData?: {
    lat?: number
    lng?: number
    addressLine?: string
    showroomSqft?: number
    workshopBays?: number
    leaseDuration?: number
    oemApproved: boolean
  }
  contracts: Array<{
    id: string
    contractType: string
    signStatus: string
    esignRef?: string
    signedAt?: string
    franchiseFee?: number
    deposit?: number
  }>
  staffMembers: Array<{
    id: string
    name: string
    role: string
    employeeId: string
    certified: boolean
  }>
}

export function DealerDetailContent({ dealer }: { dealer: DealerDetail }) {
  const router = useRouter()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isActing, setIsActing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleApprove = async () => {
    setIsActing(true)
    setActionError(null)
    try {
      const res = await fetch('/api/stage/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId: dealer.id, targetStage: dealer.currentStage + 1 }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Advance failed')
      } else {
        setShowApproveModal(false)
        router.refresh()
      }
    } catch {
      setActionError('Network error')
    } finally {
      setIsActing(false)
    }
  }

  const getDocsByStage = (stage: number) => dealer.documents.filter(d => d.stage === stage)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-sand/20 text-sand hover:text-ink transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">{dealer.entityName}</h1>
            <StageBadge stage={dealer.currentStage} />
            <Badge variant={dealer.status === 'live' ? 'success' : dealer.status === 'rejected' ? 'error' : 'warning'}>
              {dealer.status}
            </Badge>
          </div>
          <p className="text-sand text-sm mt-1">GSTIN: {dealer.gstIn} · Joined {formatDistanceToNow(new Date(dealer.createdAt), { addSuffix: true })}</p>
        </div>
        {/* Admin actions */}
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={() => setShowRejectModal(true)}>
            <XCircle className="w-4 h-4" /> Reject
          </Button>
          <Button variant="ghost" size="sm">
            <Flag className="w-4 h-4" /> Flag
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowApproveModal(true)}>
            <CheckCircle className="w-4 h-4" /> Approve Stage
          </Button>
        </div>
      </div>

      {/* Stage pipeline */}
      <Card>
        <div className="pb-8">
          <StagePipeline
            currentStage={dealer.currentStage}
            stageHistory={dealer.stageHistory.map(h => ({ stage: h.stage, action: h.action, createdAt: h.createdAt }))}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Dealer info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dealer Info</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {[
                { icon: User, label: 'Promoter', value: dealer.promoterName },
                { icon: Building2, label: 'Company', value: dealer.entityName },
                { icon: Mail, label: 'Email', value: dealer.email },
                { icon: Phone, label: 'Mobile', value: dealer.mobile },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sand/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate" />
                  </div>
                  <div>
                    <p className="text-xs text-sand">{label}</p>
                    <p className="text-sm font-medium text-ink">{value}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-sand/20">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-sand">PAN</p>
                    <p className="font-mono text-ink">{dealer.pan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sand">City Tier</p>
                    <p className="text-ink capitalize">{dealer.cityTier}</p>
                  </div>
                  {dealer.netWorthRange && (
                    <div>
                      <p className="text-xs text-sand">Net Worth</p>
                      <p className="text-ink">{dealer.netWorthRange}</p>
                    </div>
                  )}
                  {dealer.oemName && (
                    <div>
                      <p className="text-xs text-sand">OEM</p>
                      <p className="text-ink">{dealer.oemName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Contracts */}
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {dealer.contracts.length === 0 ? (
                <p className="text-sm text-sand text-center py-3">No contracts yet</p>
              ) : (
                dealer.contracts.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-sand/10 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-ink capitalize">{c.contractType.replace('_', ' ')}</p>
                      {c.esignRef && <p className="text-xs font-mono text-sand">{c.esignRef}</p>}
                    </div>
                    <Badge variant={c.signStatus === 'signed' ? 'success' : c.signStatus === 'rejected' ? 'error' : 'warning'} size="sm">
                      {c.signStatus}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Staff */}
          <Card>
            <CardHeader>
              <CardTitle>Staff ({dealer.staffMembers.length})</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {dealer.staffMembers.length === 0 ? (
                <p className="text-sm text-sand text-center py-3">No staff added</p>
              ) : (
                dealer.staffMembers.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-sand/10 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-ink">{s.name}</p>
                      <p className="text-xs text-sand capitalize">{s.role.replace('_', ' ')}</p>
                    </div>
                    <Badge variant={s.certified ? 'success' : 'warning'} size="sm">
                      {s.certified ? 'Certified' : 'Pending'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Center: Documents by stage */}
        <div className="xl:col-span-1 space-y-4">
          {STAGE_CONFIGS.map(stageConfig => {
            const stageDocs = getDocsByStage(stageConfig.stage)
            if (stageDocs.length === 0 && stageConfig.stage > dealer.currentStage) return null

            return (
              <Card key={stageConfig.stage}>
                <CardHeader>
                  <div>
                    <CardTitle>Stage {stageConfig.stage} — {stageConfig.name}</CardTitle>
                    <p className="text-xs text-sand mt-0.5">{stageDocs.length} documents</p>
                  </div>
                  {stageConfig.stage < dealer.currentStage && (
                    <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3" /> Done</Badge>
                  )}
                </CardHeader>
                <div className="space-y-2">
                  {stageDocs.length === 0 ? (
                    <p className="text-xs text-sand py-2">No documents uploaded</p>
                  ) : (
                    stageDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-sand/10 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-slate flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-ink truncate capitalize">{doc.docType.replace(/_/g, ' ')}</p>
                            {doc.verifyApi && <p className="text-xs text-sand/60">{doc.verifyApi}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <VerificationBadge status={doc.verifyStatus as 'pending' | 'verifying' | 'verified' | 'failed'} size="sm" showLabel={false} />
                          {doc.storagePath && (
                            <a href={`/api/upload?path=${encodeURIComponent(doc.storagePath)}`} target="_blank" rel="noopener noreferrer" className="text-slate hover:text-ink">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Right: Timeline + Map */}
        <div className="space-y-4">
          {/* Stage history */}
          <Card>
            <CardHeader>
              <CardTitle>Stage History</CardTitle>
            </CardHeader>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dealer.stageHistory.length === 0 ? (
                <p className="text-sm text-sand text-center py-4">No transitions yet</p>
              ) : (
                dealer.stageHistory.map(tx => (
                  <div key={tx.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-sand/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-sand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink">
                        Stage {tx.stage - 1} → {tx.stage} · {tx.action}
                      </p>
                      <p className="text-xs text-sand">{tx.triggeredBy} · {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</p>
                      {tx.reason && <p className="text-xs text-sand/60 italic">{tx.reason}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Site assessment map */}
          {dealer.siteData && (
            <Card>
              <CardHeader>
                <CardTitle>Site Assessment</CardTitle>
                {dealer.siteData.oemApproved && (
                  <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3" /> Approved</Badge>
                )}
              </CardHeader>
              <div className="space-y-3">
                <SiteMap lat={dealer.siteData.lat} lng={dealer.siteData.lng} height={200} interactive={false} />
                {dealer.siteData.showroomSqft && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-sand/10 rounded-lg p-2">
                      <p className="text-xs text-sand">Area</p>
                      <p className="text-sm font-semibold text-ink">{dealer.siteData.showroomSqft} sq.ft</p>
                    </div>
                    <div className="bg-sand/10 rounded-lg p-2">
                      <p className="text-xs text-sand">Bays</p>
                      <p className="text-sm font-semibold text-ink">{dealer.siteData.workshopBays ?? '—'}</p>
                    </div>
                    <div className="bg-sand/10 rounded-lg p-2">
                      <p className="text-xs text-sand">Lease</p>
                      <p className="text-sm font-semibold text-ink">{dealer.siteData.leaseDuration ?? '—'} mo</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {actionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {actionError}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      <ConfirmModal
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        loading={isActing}
        title="Approve Stage Advance"
        description={`Advance ${dealer.entityName} from Stage ${dealer.currentStage} to Stage ${dealer.currentStage + 1}? This requires all documents to be verified.`}
        confirmLabel="Approve & Advance"
      />

      {/* Reject Modal */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Dealer Application" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-2">Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Explain the reason for rejection…"
              className="w-full border border-sand/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-sand/60 focus:outline-none focus:ring-2 focus:ring-slate/30 resize-none"
              rows={4}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button variant="danger" size="sm" disabled={!rejectReason.trim()}>Confirm Rejection</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
