'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, Download, ExternalLink } from 'lucide-react'
import { StageBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDistanceToNow } from 'date-fns'

interface DealerRow {
  id: string
  entityName: string
  gstIn: string
  cityTier: string
  oemName?: string
  currentStage: number
  status: string
  docsVerified?: number
  docsTotal?: number
  createdAt: string
}

interface DealerPipelineTableProps {
  dealers: DealerRow[]
  loading?: boolean
}

type SortKey = keyof Pick<DealerRow, 'entityName' | 'currentStage' | 'createdAt' | 'cityTier'>

export function DealerPipelineTable({ dealers, loading }: DealerPipelineTableProps) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    return [...dealers].sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [dealers, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const exportCSV = () => {
    const headers = ['Entity', 'GSTIN', 'City Tier', 'OEM', 'Stage', 'Docs', 'Created']
    const rows = sorted.map(d => [
      d.entityName, d.gstIn, d.cityTier, d.oemName ?? '',
      d.currentStage, `${d.docsVerified ?? 0}/${d.docsTotal ?? 0}`,
      new Date(d.createdAt).toLocaleDateString('en-IN'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dealers-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortHeader = ({ label, colKey }: { label: string; colKey: SortKey }) => (
    <button
      onClick={() => handleSort(colKey)}
      className="flex items-center gap-1 text-xs font-semibold text-sand uppercase tracking-wider hover:text-ink transition-colors cursor-pointer"
    >
      {label}
      <ArrowUpDown className={['w-3 h-3', sortKey === colKey ? 'text-slate' : ''].join(' ')} />
    </button>
  )

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 skeleton rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sand/30">
        <table className="w-full text-sm">
          <thead className="bg-sand/10 border-b border-sand/20">
            <tr>
              <th className="px-4 py-3 text-left"><SortHeader label="Entity" colKey="entityName" /></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-sand uppercase tracking-wider">GSTIN</th>
              <th className="px-4 py-3 text-left"><SortHeader label="City Tier" colKey="cityTier" /></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-sand uppercase tracking-wider">OEM</th>
              <th className="px-4 py-3 text-left"><SortHeader label="Stage" colKey="currentStage" /></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-sand uppercase tracking-wider">Docs</th>
              <th className="px-4 py-3 text-left"><SortHeader label="Created" colKey="createdAt" /></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-sand uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/10">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-sand text-sm">No dealers found</td>
              </tr>
            )}
            {sorted.map(dealer => (
              <tr
                key={dealer.id}
                className="hover:bg-sand/5 transition-colors cursor-pointer"
                onClick={() => router.push(`/oem/dealer/${dealer.id}`)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{dealer.entityName}</p>
                </td>
                <td className="px-4 py-3 text-sand font-mono text-xs">{dealer.gstIn}</td>
                <td className="px-4 py-3 text-ink/70">{dealer.cityTier}</td>
                <td className="px-4 py-3 text-ink/70">{dealer.oemName ?? '—'}</td>
                <td className="px-4 py-3"><StageBadge stage={dealer.currentStage} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-sand">{dealer.docsVerified ?? 0}/{dealer.docsTotal ?? 0}</span>
                    <div className="w-16 h-1.5 bg-sand/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate rounded-full"
                        style={{ width: `${dealer.docsTotal ? ((dealer.docsVerified ?? 0) / dealer.docsTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-sand">
                  {formatDistanceToNow(new Date(dealer.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); router.push(`/oem/dealer/${dealer.id}`) }}
                  >
                    <ExternalLink className="w-3 h-3" /> View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
