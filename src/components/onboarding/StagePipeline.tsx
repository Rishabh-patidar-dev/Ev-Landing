'use client'

import { STAGE_CONFIGS } from '@/lib/validators/stage'

interface StageHistory {
  stage: number
  action: string
  createdAt: string
}

interface StagePipelineProps {
  currentStage: number
  stageHistory?: StageHistory[]
  onStageClick?: (stage: number) => void
  compact?: boolean
}

export function StagePipeline({
  currentStage,
  stageHistory = [],
  onStageClick,
  compact = false,
}: StagePipelineProps) {
  const getCompletionDate = (stage: number) => {
    const tx = stageHistory.find(
      (h) => h.stage === stage + 1 && h.action === 'advance'
    )
    if (!tx) return null
    return new Date(tx.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /* Compact mode: small dots */
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STAGE_CONFIGS.map((config) => {
          const isCompleted = config.stage < currentStage
          const isCurrent = config.stage === currentStage
          return (
            <button
              key={config.stage}
              onClick={() => onStageClick?.(config.stage)}
              disabled={config.stage > currentStage}
              aria-label={`Stage ${config.stage}: ${config.name}`}
              className={[
                'w-2 h-2 rounded-full transition-colors',
                isCompleted
                  ? 'bg-slate'
                  : isCurrent
                  ? 'bg-stone'
                  : 'bg-sand/30',
              ].join(' ')}
            />
          )
        })}
      </div>
    )
  }

  /* Full mode: numbered steps */
  return (
    <div className="flex items-start gap-0">
      {STAGE_CONFIGS.map((config, idx) => {
        const isCompleted = config.stage < currentStage
        const isCurrent = config.stage === currentStage
        const isLocked = config.stage > currentStage
        const completionDate = getCompletionDate(config.stage)

        return (
          <div key={config.stage} className="flex-1 flex flex-col items-center relative">
            {/* Connector line */}
            {idx < STAGE_CONFIGS.length - 1 && (
              <div
                className={[
                  'absolute top-4 left-1/2 w-full h-0.5',
                  isCompleted ? 'bg-slate' : 'bg-sand/20',
                ].join(' ')}
              />
            )}

            {/* Node */}
            <button
              onClick={() => onStageClick?.(config.stage)}
              disabled={isLocked || isCurrent}
              aria-label={`Stage ${config.stage}: ${config.name}`}
              title={isCompleted && completionDate ? `Completed ${completionDate}` : isCurrent ? 'In Progress' : undefined}
              className={[
                'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                'text-xs font-semibold transition-colors relative z-10',
                isCompleted
                  ? 'bg-slate border-slate text-brand-white cursor-pointer'
                  : isCurrent
                  ? 'bg-stone border-stone text-ink stage-pulse cursor-default'
                  : 'bg-brand-white border-sand/30 text-sand/40 cursor-default',
              ].join(' ')}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{config.stage}</span>
              )}
            </button>

            {/* Label */}
            <span className="text-[11px] text-sand/60 mt-1.5 text-center leading-tight px-1">
              {config.name.split(' ')[0]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
