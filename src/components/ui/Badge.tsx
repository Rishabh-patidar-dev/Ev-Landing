import { ReactNode } from 'react'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'stage4'
  | 'stage5'
  | 'live'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-sand/20 text-ink/50',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  stage1: 'bg-sand/20 text-ink/50',
  stage2: 'bg-amber-100 text-amber-700',
  stage3: 'bg-sky-100 text-sky-700',
  stage4: 'bg-violet-100 text-violet-700',
  stage5: 'bg-teal-100 text-teal-700',
  live: 'bg-emerald-100 text-emerald-700',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}

export function StageBadge({ stage }: { stage: number }) {
  const configs: Record<number, { label: string; variant: BadgeVariant }> = {
    1: { label: 'Stage 1 · KYC', variant: 'stage1' },
    2: { label: 'Stage 2 · Finance', variant: 'stage2' },
    3: { label: 'Stage 3 · Site', variant: 'stage3' },
    4: { label: 'Stage 4 · Contracts', variant: 'stage4' },
    5: { label: 'Stage 5 · Training', variant: 'stage5' },
    6: { label: 'Live', variant: 'live' },
  }
  const config = configs[stage] ?? {
    label: `Stage ${stage}`,
    variant: 'default' as BadgeVariant,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
