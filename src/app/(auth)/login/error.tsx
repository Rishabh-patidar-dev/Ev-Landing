'use client'

export default function LoginError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-ink mb-2">Something went wrong</h2>
        <p className="text-sand text-sm mb-4">{error.message}</p>
        <button onClick={reset} className="text-slate underline text-sm cursor-pointer">Try again</button>
      </div>
    </div>
  )
}
