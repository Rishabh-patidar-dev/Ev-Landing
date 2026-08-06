'use client'

import Link from 'next/link'
import { Check, Lock } from 'lucide-react'
import { STAGE_CONFIGS } from '@/lib/validators/stage'

interface OnboardingStepperProps {
  currentStage: number
  activeStep: number
}

export function OnboardingStepper({ currentStage, activeStep }: OnboardingStepperProps) {
  return (
    <div className="bg-brand-white border-b border-sand/20">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-start">
          {STAGE_CONFIGS.map((config, idx) => {
            const isCompleted = config.stage < currentStage
            const isLocked = config.stage > currentStage
            const isViewing = config.stage === activeStep

            return (
              <div key={config.stage} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {idx < STAGE_CONFIGS.length - 1 && (
                  <div
                    aria-hidden
                    className={[
                      'absolute top-5 left-[calc(50%+1.25rem)] right-0 h-0.5 transition-colors',
                      isCompleted ? 'bg-slate' : 'bg-sand/20',
                    ].join(' ')}
                  />
                )}

                {/* Circle node — all stages are navigable */}
                <Link
                  href={`/onboarding/${config.stage}`}
                  aria-label={`Stage ${config.stage}: ${config.name}${isLocked ? ' — preview' : ''}`}
                  aria-current={isViewing ? 'step' : undefined}
                  title={isLocked ? 'Preview this stage' : undefined}
                  className={[
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                    'text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone focus-visible:ring-offset-2',
                    isViewing && isCompleted
                      ? 'bg-slate text-brand-white ring-2 ring-slate ring-offset-2 scale-110 shadow-md'
                      : isViewing && isLocked
                      ? 'bg-sand/30 text-sand/70 ring-2 ring-sand/40 ring-offset-2 scale-110'
                      : isViewing
                      ? 'bg-stone text-ink ring-2 ring-stone ring-offset-2 scale-110 shadow-md'
                      : isCompleted
                      ? 'bg-slate text-brand-white hover:opacity-80'
                      : isLocked
                      ? 'bg-sand/10 text-sand/40 border-2 border-sand/20 hover:border-sand/40 hover:text-sand/60 transition-colors'
                      : 'bg-stone/20 text-stone border-2 border-stone/50',
                  ].join(' ')}
                >
                  {isCompleted
                    ? <Check className="w-4 h-4" strokeWidth={3} />
                    : isLocked && !isViewing
                    ? <Lock className="w-3.5 h-3.5" />
                    : <span>{config.stage}</span>
                  }
                </Link>

                {/* Label */}
                <div className="mt-2.5 text-center max-w-[90px]">
                  <p className={[
                    'text-[11px] font-medium leading-tight',
                    isViewing ? 'text-ink' : isCompleted ? 'text-slate' : isLocked ? 'text-sand/30' : 'text-sand/70',
                  ].join(' ')}>
                    {config.name}
                  </p>
                  <p className={[
                    'text-[10px] mt-0.5',
                    isViewing && isLocked ? 'text-sand/60 font-semibold'
                      : isViewing && !isCompleted ? 'text-stone font-semibold'
                      : isCompleted ? 'text-slate/60'
                      : 'text-sand/30',
                  ].join(' ')}>
                    {isCompleted ? 'Completed' : isViewing && isLocked ? 'Preview' : isViewing ? 'In Progress' : 'Upcoming'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
