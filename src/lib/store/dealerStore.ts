import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type VerifyStatus = 'pending' | 'verifying' | 'verified' | 'failed'

export interface DealerDocument {
  id: string
  docType: string
  stage: number
  storagePath?: string
  verifyStatus: VerifyStatus
  uploadedAt: string
}

export interface DealerState {
  id: string | null
  entityName: string | null
  email: string | null
  mobile: string | null
  currentStage: number
  status: string
  oemId: string | null
  documents: DealerDocument[]
  stageHistory: Array<{
    id: string
    stage: number
    action: string
    triggeredBy: string
    reason?: string
    createdAt: string
  }>
  isLoading: boolean
  error: string | null
}

export interface DealerActions {
  setDealer: (dealer: Partial<DealerState>) => void
  setDocuments: (documents: DealerDocument[]) => void
  updateDocStatus: (docType: string, stage: number, status: VerifyStatus) => void
  addDocument: (doc: DealerDocument) => void
  setStageHistory: (history: DealerState['stageHistory']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: DealerState = {
  id: null,
  entityName: null,
  email: null,
  mobile: null,
  currentStage: 1,
  status: 'pending',
  oemId: null,
  documents: [],
  stageHistory: [],
  isLoading: false,
  error: null,
}

export const useDealerStore = create<DealerState & DealerActions>()(
  persist(
    (set) => ({
      ...initialState,
      setDealer: (dealer) => set((state) => ({ ...state, ...dealer })),
      setDocuments: (documents) => set({ documents }),
      updateDocStatus: (docType, stage, status) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.docType === docType && d.stage === stage
              ? { ...d, verifyStatus: status }
              : d
          ),
        })),
      addDocument: (doc) =>
        set((state) => ({
          documents: [
            ...state.documents.filter(
              (d) => !(d.docType === doc.docType && d.stage === doc.stage)
            ),
            doc,
          ],
        })),
      setStageHistory: (stageHistory) => set({ stageHistory }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'dealer-store',
      partialize: (state) => ({
        id: state.id,
        entityName: state.entityName,
        email: state.email,
        currentStage: state.currentStage,
        status: state.status,
      }),
    }
  )
)
