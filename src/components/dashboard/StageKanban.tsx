'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ConfirmModal } from '@/components/ui/Modal'
import { DealerCard } from './DealerCard'
import { formatDistanceToNow } from 'date-fns'

interface KanbanDealer {
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

interface StageKanbanProps {
  dealers: KanbanDealer[]
  onAdvanceStage?: (dealerId: string, targetStage: number) => Promise<void>
}

const COLUMNS = [
  { stage: 1, label: 'Stage 1 · KYC' },
  { stage: 2, label: 'Stage 2 · Finance' },
  { stage: 3, label: 'Stage 3 · Site' },
  { stage: 4, label: 'Stage 4 · Contracts' },
  { stage: 5, label: 'Stage 5 · Training' },
  { stage: 6, label: 'Live' },
]

const columnColors: Record<number, string> = {
  1: 'border-sand/30 bg-sand/5',
  2: 'border-amber-200 bg-amber-50/50',
  3: 'border-blue-200 bg-blue-50/50',
  4: 'border-purple-200 bg-purple-50/50',
  5: 'border-teal-200 bg-teal-50/50',
  6: 'border-green-200 bg-green-50/50',
}

function SortableCard({ dealer, onClick }: { dealer: KanbanDealer; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dealer.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'opacity-50' : ''}
      {...attributes}
      {...listeners}
    >
      <DealerCard dealer={dealer} onClick={onClick} />
    </div>
  )
}

export function StageKanban({ dealers, onAdvanceStage }: StageKanbanProps) {
  const router = useRouter()
  const [activeDealer, setActiveDealer] = useState<KanbanDealer | null>(null)
  const [pendingMove, setPendingMove] = useState<{ dealer: KanbanDealer; targetStage: number } | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const getDealersForStage = useCallback(
    (stage: number) => dealers.filter(d => d.currentStage === stage),
    [dealers]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const dealer = dealers.find(d => d.id === event.active.id)
    if (dealer) setActiveDealer(dealer)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDealer(null)

    if (!over) return

    const dealerId = active.id as string
    const dealer = dealers.find(d => d.id === dealerId)
    if (!dealer) return

    const targetStage = parseInt(String(over.id).replace('column-', ''))
    if (isNaN(targetStage) || targetStage === dealer.currentStage) return
    if (targetStage !== dealer.currentStage + 1) return // Only allow adjacent advance

    setPendingMove({ dealer, targetStage })
  }

  const confirmAdvance = async () => {
    if (!pendingMove || !onAdvanceStage) return
    setIsAdvancing(true)
    try {
      await onAdvanceStage(pendingMove.dealer.id, pendingMove.targetStage)
    } finally {
      setIsAdvancing(false)
      setPendingMove(null)
    }
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colDealers = getDealersForStage(col.stage)
            return (
              <div
                key={col.stage}
                id={`column-${col.stage}`}
                className={['flex-shrink-0 w-72 rounded-2xl border p-3', columnColors[col.stage]].join(' ')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-ink">{col.label}</h3>
                  <span className="text-xs bg-white border border-sand/30 text-sand rounded-full px-2 py-0.5">
                    {colDealers.length}
                  </span>
                </div>
                <SortableContext items={colDealers.map(d => d.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 min-h-24">
                    {colDealers.map(dealer => (
                      <SortableCard
                        key={dealer.id}
                        dealer={dealer}
                        onClick={() => router.push(`/oem/dealer/${dealer.id}`)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activeDealer && <DealerCard dealer={activeDealer} />}
        </DragOverlay>
      </DndContext>

      <ConfirmModal
        open={!!pendingMove}
        onClose={() => setPendingMove(null)}
        onConfirm={confirmAdvance}
        loading={isAdvancing}
        title="Advance Stage"
        description={`Advance ${pendingMove?.dealer.entityName} to Stage ${pendingMove?.targetStage}? This will log a manual override in the stage history.`}
        confirmLabel="Advance Stage"
      />
    </>
  )
}
