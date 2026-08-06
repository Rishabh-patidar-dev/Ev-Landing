import { create } from 'zustand'

export type ViewMode = 'kanban' | 'table'

export interface DashboardFilters {
  stage: number | null
  oemId: string | null
  cityTier: string | null
  status: string | null
  search: string
}

export interface DashboardStats {
  totalDealers: number
  byStage: Record<string, number>
  totalActive: number
  totalPending: number
  totalLive: number
  recentSignups: number
  dealersByStage: Array<{ stage: number; count: number }>
}

export interface DashboardState {
  viewMode: ViewMode
  filters: DashboardFilters
  stats: DashboardStats | null
  isLoadingStats: boolean
  lastRefreshed: number | null
}

export interface DashboardActions {
  setViewMode: (mode: ViewMode) => void
  setFilter: (key: keyof DashboardFilters, value: DashboardFilters[keyof DashboardFilters]) => void
  clearFilters: () => void
  setStats: (stats: DashboardStats) => void
  setLoadingStats: (loading: boolean) => void
  refreshTimestamp: () => void
}

const initialFilters: DashboardFilters = {
  stage: null,
  oemId: null,
  cityTier: null,
  status: null,
  search: '',
}

export const useDashboardStore = create<DashboardState & DashboardActions>((set) => ({
  viewMode: 'kanban',
  filters: initialFilters,
  stats: null,
  isLoadingStats: false,
  lastRefreshed: null,

  setViewMode: (viewMode) => set({ viewMode }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: initialFilters }),
  setStats: (stats) => set({ stats }),
  setLoadingStats: (isLoadingStats) => set({ isLoadingStats }),
  refreshTimestamp: () => set({ lastRefreshed: Date.now() }),
}))
