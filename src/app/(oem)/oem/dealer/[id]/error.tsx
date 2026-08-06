'use client'

export default function DealerDetailError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md p-8">
        <h2 className="text-xl font-bold text-ink mb-2">Error Loading Dealer</h2>
        <p className="text-sand text-sm mb-4">{error.message}</p>
        <button onClick={reset} className="text-slate underline text-sm cursor-pointer">Retry</button>
      </div>
    </div>
  )
}
