'use client'

import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import type { VerifyStatus } from '@/lib/store/dealerStore'

interface VerificationBadgeProps {
  status: VerifyStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const configs = {
  pending: {
    icon: Clock,
    color: 'text-sand',
    bg: 'bg-sand/10',
    label: 'Pending',
    ringColor: 'ring-sand/30',
  },
  verifying: {
    icon: Loader2,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    label: 'Verifying',
    ringColor: 'ring-amber-300',
  },
  verified: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'Verified',
    ringColor: 'ring-green-300',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'Failed',
    ringColor: 'ring-red-300',
  },
}

const sizeClasses = {
  sm: { icon: 'w-4 h-4', container: 'p-1', text: 'text-xs' },
  md: { icon: 'w-5 h-5', container: 'p-1.5', text: 'text-sm' },
  lg: { icon: 'w-6 h-6', container: 'p-2', text: 'text-base' },
}

export function VerificationBadge({ status, size = 'md', showLabel = true }: VerificationBadgeProps) {
  const config = configs[status]
  const Icon = config.icon
  const s = sizeClasses[size]

  return (
    <div className="flex items-center gap-2">
      <div className={['rounded-full ring-2', config.bg, config.ringColor, s.container].join(' ')}>
        <Icon
          className={[s.icon, config.color, status === 'verifying' ? 'animate-spin' : ''].join(' ')}
        />
      </div>
      {showLabel && (
        <span className={['font-medium', config.color, s.text].join(' ')}>{config.label}</span>
      )}
    </div>
  )
}

export function VerificationRing({ status, progress }: { status: VerifyStatus; progress?: number }) {
  const size = 48
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = progress !== undefined ? circumference * (1 - progress / 100) : circumference

  const colorMap: Record<VerifyStatus, string> = {
    pending: '#B5B8B5',
    verifying: '#F59E0B',
    verified: '#16A34A',
    failed: '#EF4444',
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--sand)" strokeWidth={strokeWidth} strokeOpacity={0.2} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[status]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {status === 'verifying' ? (
          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
        ) : status === 'verified' ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : status === 'failed' ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : (
          <Clock className="w-4 h-4 text-sand" />
        )}
      </div>
    </div>
  )
}
