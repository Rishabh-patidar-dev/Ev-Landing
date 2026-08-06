import { Clock, DollarSign, Users, FileCheck } from 'lucide-react'
import { getStageConfig } from '@/lib/validators/stage'
import { Card } from '@/components/ui/Card'

interface StageDetailPanelProps {
  stage: number
  verifiedCount?: number
  totalCount?: number
}

export function StageDetailPanel({ stage, verifiedCount = 0, totalCount }: StageDetailPanelProps) {
  const config = getStageConfig(stage)
  if (!config) return null

  const total = totalCount ?? config.docs.length
  const progressPct = total > 0 ? (verifiedCount / total) * 100 : 0

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-sand uppercase tracking-wider mb-1">Current Stage</p>
        <h2 className="text-lg font-bold text-ink">
          Stage {config.stage} — {config.name}
        </h2>
        <p className="text-sm text-ink/60 mt-1">{config.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 bg-sand/10 rounded-xl p-3">
          <Users className="w-4 h-4 text-slate" />
          <div>
            <p className="text-xs text-sand">Department</p>
            <p className="text-xs font-semibold text-ink">{config.dept}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-sand/10 rounded-xl p-3">
          <Clock className="w-4 h-4 text-slate" />
          <div>
            <p className="text-xs text-sand">Timeline</p>
            <p className="text-xs font-semibold text-ink">{config.estimatedDays}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-sand/10 rounded-xl p-3">
          <DollarSign className="w-4 h-4 text-slate" />
          <div>
            <p className="text-xs text-sand">Cost</p>
            <p className="text-xs font-semibold text-ink">{config.costRange}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-slate" />
            <span className="text-sm font-medium text-ink">Documents</span>
          </div>
          <span className="text-sm font-semibold text-slate">{verifiedCount}/{total} verified</span>
        </div>
        <div className="h-2 bg-sand/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
