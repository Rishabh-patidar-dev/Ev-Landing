import { Card } from '@/components/ui/Card'

interface StatsData {
  totalDealers: number
  byStage: Record<string, number>
  totalActive: number
  totalPending: number
  totalLive: number
  recentSignups: number
}

interface StatCardsProps {
  stats: StatsData | null
  loading?: boolean
}

const stageColors: Record<number, string> = {
  1: 'bg-sand/60',
  2: 'bg-amber-400',
  3: 'bg-sky-400',
  4: 'bg-violet-400',
  5: 'bg-teal-400',
}

const stageLabels: Record<number, string> = {
  1: 'KYC',
  2: 'Finance',
  3: 'Site',
  4: 'Contracts',
  5: 'Training',
}

export function StatCards({ stats, loading }: StatCardsProps) {
  const summaryStats = [
    { label: 'Total Dealers', value: stats?.totalDealers ?? 0 },
    { label: 'Live', value: stats?.totalLive ?? 0 },
    { label: 'Pending', value: stats?.totalPending ?? 0 },
    { label: 'New (7 days)', value: stats?.recentSignups ?? 0 },
  ]

  const stageCounts = [1, 2, 3, 4, 5].map((s) => ({
    stage: s,
    count: stats?.byStage?.[`stage_${s}`] ?? 0,
  }))
  const maxCount = Math.max(1, ...stageCounts.map((s) => s.count))
  const MAX_BAR_PX = 64
  const MIN_BAR_PX = 4

  return (
    <div className="space-y-4">
      {/* Summary stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryStats.map(({ label, value }) => (
          <Card key={label} padding="sm">
            {loading ? (
              <div className="h-8 w-16 skeleton rounded mb-1" />
            ) : (
              <p className="text-2xl font-bold text-ink">{value}</p>
            )}
            <p className="text-xs text-sand/70 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* Stage distribution */}
      <Card>
        <p className="text-sm font-semibold text-ink mb-4">Dealers by Stage</p>
        <div className="flex items-end gap-3">
          {stageCounts.map(({ stage, count }) => {
            const barH = loading
              ? MIN_BAR_PX
              : Math.max(MIN_BAR_PX, Math.round((count / maxCount) * MAX_BAR_PX))

            return (
              <div
                key={stage}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <span className="text-xs font-medium text-ink/50">
                  {loading ? '' : count}
                </span>
                <div
                  className={[
                    'w-full rounded-t transition-all duration-500',
                    loading ? 'skeleton' : stageColors[stage],
                  ].join(' ')}
                  style={{ height: `${barH}px` }}
                />
                <span className="text-[11px] text-sand/60">
                  {stageLabels[stage]}
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
