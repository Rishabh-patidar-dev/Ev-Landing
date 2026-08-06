'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStageConfig } from '@/lib/validators/stage'
import { DocumentUploadZone } from '@/components/onboarding/DocumentUploadZone'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowRight, Clock, ChevronRight } from 'lucide-react'
import type { VerifyStatus } from '@/lib/store/dealerStore'
import { formatDistanceToNow } from 'date-fns'

interface DealerDoc {
  id: string
  docType: string
  stage: number
  storagePath?: string
  verifyStatus: VerifyStatus
  uploadedAt: string
}

interface StageHistoryItem {
  id: string
  stage: number
  action: string
  triggeredBy: string
  reason?: string
  createdAt: string
}

interface DashboardContentProps {
  dealer: {
    id: string
    currentStage: number
    status: string
    documents: DealerDoc[]
    stageHistory: StageHistoryItem[]
  }
}

export function DealerDashboardContent({ dealer }: DashboardContentProps) {
  const router = useRouter()
  const config = getStageConfig(dealer.currentStage)
  const [docStatuses, setDocStatuses] = useState<Record<string, VerifyStatus>>(
    Object.fromEntries(dealer.documents.map(d => [d.docType, d.verifyStatus]))
  )
  const [advancing, setAdvancing] = useState(false)
  const [advanceError, setAdvanceError] = useState<string | null>(null)

  const requiredDocs = config?.docs.filter(d => d.required) ?? []
  const verifiedCount = requiredDocs.filter(d => docStatuses[d.docType] === 'verified').length
  const allVerified = verifiedCount === requiredDocs.length

  const handleStatusChange = (docType: string, status: VerifyStatus) => {
    setDocStatuses(prev => ({ ...prev, [docType]: status }))
  }

  const handleAdvanceStage = async () => {
    if (!allVerified) return
    setAdvancing(true)
    setAdvanceError(null)
    try {
      const res = await fetch('/api/stage/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId: dealer.id, targetStage: dealer.currentStage + 1 }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAdvanceError(data.error || 'Failed to advance stage')
      } else {
        router.refresh()
      }
    } catch {
      setAdvanceError('Network error. Please try again.')
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Document upload section */}
      <Card>
        <CardHeader>
          <CardTitle>Stage {dealer.currentStage} Documents</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/stage/${dealer.currentStage}`)}
          >
            Full view <ChevronRight className="w-4 h-4" />
          </Button>
        </CardHeader>

        <div className="space-y-3">
          {requiredDocs.map(doc => {
            const uploaded = dealer.documents.find(d => d.docType === doc.docType && d.stage === dealer.currentStage)
            return (
              <DocumentUploadZone
                key={doc.docType}
                docType={doc.docType}
                label={doc.label}
                hint={doc.hint}
                stage={dealer.currentStage}
                dealerId={dealer.id}
                verifyApi={doc.verifyApi}
                accept={doc.accept}
                currentStatus={docStatuses[doc.docType] ?? 'pending'}
                storagePath={uploaded?.storagePath}
                onStatusChange={(status) => handleStatusChange(doc.docType, status)}
              />
            )
          })}
        </div>

        {/* Advance stage CTA */}
        <div className="mt-6 pt-4 border-t border-sand/20">
          {advanceError && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {advanceError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">
                {verifiedCount}/{requiredDocs.length} documents verified
              </p>
              {!allVerified && (
                <p className="text-xs text-sand mt-0.5">Verify all documents to advance to Stage {dealer.currentStage + 1}</p>
              )}
            </div>
            <Button
              onClick={handleAdvanceStage}
              disabled={!allVerified || advancing}
              loading={advancing}
              variant={allVerified ? 'primary' : 'ghost'}
              size="md"
            >
              Request Stage Advance <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Stage history timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Stage History</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {dealer.stageHistory.length === 0 ? (
            <p className="text-sm text-sand text-center py-4">No stage transitions yet</p>
          ) : (
            dealer.stageHistory.slice(0, 6).map(tx => (
              <div key={tx.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-sand/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-sand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium">
                    Stage {tx.stage - 1} → Stage {tx.stage}
                    {tx.action === 'advance' ? ' Advanced' : tx.action === 'rollback' ? ' Rolled back' : ' Rejected'}
                  </p>
                  <p className="text-xs text-sand mt-0.5">
                    {tx.triggeredBy} · {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </p>
                  {tx.reason && <p className="text-xs text-sand/70 mt-0.5 italic">{tx.reason}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
