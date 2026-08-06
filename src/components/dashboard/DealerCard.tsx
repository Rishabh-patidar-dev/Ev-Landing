'use client'

import { StageBadge } from '@/components/ui/Badge'
import { StagePipeline } from '@/components/onboarding/StagePipeline'
import { formatDistanceToNow } from 'date-fns'

interface DealerCardProps {
  dealer: {
    id: string
    entityName: string
    cityTier: string
    currentStage: number
    status: string
    createdAt: string
    oemName?: string
    docsVerified?: number
    docsTotal?: number
  }
  onClick?: () => void
  compact?: boolean
}

export function DealerCard({
  dealer,
  onClick,
  compact = false,
}: DealerCardProps) {
  const daysInSystem = formatDistanceToNow(new Date(dealer.createdAt), {
    addSuffix: false,
  })
  const progressPct = dealer.docsTotal
    ? Math.round(((dealer.docsVerified ?? 0) / dealer.docsTotal) * 100)
    : 0

  return (
    <div
      className={[
        'bg-brand-white rounded-xl border border-ink/[0.08] shadow-sm cursor-pointer',
        'transition-colors duration-150 hover:border-slate/30 hover:shadow-md',
        compact ? 'px-4 py-3' : 'px-4 py-4',
      ].join(' ')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-ink text-sm leading-snug truncate min-w-0 flex-1">
          {dealer.entityName}
        </p>
        <StageBadge stage={dealer.currentStage} />
      </div>

      {/* Meta line */}
      {!compact && (
        <p className="text-xs text-sand/70 mb-3 truncate">
          {dealer.cityTier}
          {dealer.oemName && (
            <>
              <span className="mx-1.5 text-sand/40">·</span>
              {dealer.oemName}
            </>
          )}
        </p>
      )}

      {/* Stage pipeline dots */}
      {!compact && (
        <div className="mb-3">
          <StagePipeline currentStage={dealer.currentStage} compact />
        </div>
      )}

      {/* Progress bar */}
      {!compact && dealer.docsTotal && (
        <div className="h-1 bg-sand/20 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-slate rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Days ago */}
      {!compact && (
        <p className="text-xs text-sand/40">{daysInSystem} ago</p>
      )}
    </div>
  )
}
