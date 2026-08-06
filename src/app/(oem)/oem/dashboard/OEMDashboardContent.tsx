'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutGrid, Table, Search, X } from 'lucide-react'
import { StageKanban } from '@/components/dashboard/StageKanban'
import { DealerPipelineTable } from '@/components/dashboard/DealerPipelineTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface DealerRow {
  id: string
  entityName: string
  gstIn: string
  cityTier: string
  oemName?: string
  currentStage: number
  status: string
  createdAt: string
  docsVerified?: number
  docsTotal?: number
}

interface OEMDashboardContentProps {
  dealers: DealerRow[]
}

export function OEMDashboardContent({ dealers }: OEMDashboardContentProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dealerList, setDealerList] = useState(dealers)

  const filtered = useMemo(() => {
    return dealerList.filter(d => {
      if (search && !d.entityName.toLowerCase().includes(search.toLowerCase()) && !d.gstIn.includes(search)) return false
      if (filterStage && String(d.currentStage) !== filterStage) return false
      if (filterCity && d.cityTier !== filterCity) return false
      if (filterStatus && d.status !== filterStatus) return false
      return true
    })
  }, [dealerList, search, filterStage, filterCity, filterStatus])

  const handleAdvanceStage = async (dealerId: string, targetStage: number) => {
    const res = await fetch('/api/stage/advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealerId, targetStage }),
    })
    if (res.ok) {
      setDealerList(prev => prev.map(d => d.id === dealerId ? { ...d, currentStage: targetStage } : d))
      router.refresh()
    }
  }

  const hasFilters = search || filterStage || filterCity || filterStatus

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-brand-white border border-sand/30 rounded-2xl p-4">
        {/* Search & filters */}
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or GSTIN…"
              className="w-full border border-sand/40 rounded-xl pl-9 pr-4 py-2 text-sm text-ink placeholder:text-sand/60 focus:outline-none focus:ring-2 focus:ring-slate/30 focus:border-slate bg-brand-white"
            />
          </div>
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="border border-sand/40 rounded-xl px-3 py-2 text-sm text-ink bg-brand-white focus:outline-none cursor-pointer"
          >
            <option value="">All Stages</option>
            {[1,2,3,4,5,6].map(s => <option key={s} value={String(s)}>Stage {s}</option>)}
          </select>
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="border border-sand/40 rounded-xl px-3 py-2 text-sm text-ink bg-brand-white focus:outline-none cursor-pointer"
          >
            <option value="">All Cities</option>
            {['tier1','tier2','tier3','tier4'].map(t => (
              <option key={t} value={t}>{t === 'tier1' ? 'Tier 1' : t === 'tier2' ? 'Tier 2' : t === 'tier3' ? 'Tier 3' : 'Tier 4'}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-sand/40 rounded-xl px-3 py-2 text-sm text-ink bg-brand-white focus:outline-none cursor-pointer"
          >
            <option value="">All Status</option>
            {['pending','active','live','rejected'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setFilterStage(''); setFilterCity(''); setFilterStatus('') }} className="flex items-center gap-1 text-sm text-sand hover:text-red-500 cursor-pointer">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-sand/10 rounded-xl p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer', viewMode === 'kanban' ? 'bg-brand-white text-ink shadow-sm' : 'text-sand hover:text-ink'].join(' ')}
          >
            <LayoutGrid className="w-4 h-4" /> Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer', viewMode === 'table' ? 'bg-brand-white text-ink shadow-sm' : 'text-sand hover:text-ink'].join(' ')}
          >
            <Table className="w-4 h-4" /> Table
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-sand">
        Showing <strong className="text-ink">{filtered.length}</strong> of {dealerList.length} dealers
      </p>

      {/* View content */}
      {viewMode === 'kanban' ? (
        <StageKanban dealers={filtered} onAdvanceStage={handleAdvanceStage} />
      ) : (
        <DealerPipelineTable dealers={filtered} />
      )}
    </div>
  )
}
