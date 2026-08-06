const stats = [
  { value: '5', label: 'Stages, fully online' },
  { value: '100%', label: 'Digital KYC & e-sign' },
  { value: '3', label: 'City tiers supported' },
  { value: '₹0', label: 'To create an account' },
]

export function StatStrip() {
  return (
    <section className="border-y border-ink/[0.07] bg-sand/10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-0 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-2 py-7 text-center sm:px-4">
            <p className="font-mono text-2xl font-semibold text-slate sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-ink/50">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
