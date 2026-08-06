'use client'

export default function RegisterError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-ink">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-brand-white mb-2">Something went wrong</h2>
        <p className="text-sand text-sm mb-4">{error.message}</p>
        <button onClick={reset} className="text-stone underline text-sm cursor-pointer">Try again</button>
      </div>
    </div>
  )
}
