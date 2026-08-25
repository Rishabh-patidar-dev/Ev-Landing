// Trust strip right under the hero — same layout slot the reference design
// uses for client logos, adapted to something this business can honestly
// claim: the regions the network is actively expanding into, not invented
// client names or unverifiable numbers.
const regions = [
  'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Delhi NCR', 'Karnataka', 'Punjab',
]

export function StatStrip() {
  return (
    <section className="px-5 pb-4 sm:pb-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-sand/[0.06] px-6 py-6 sm:px-10">
        <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-widest text-ink/35">
          Now onboarding dealers across
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {regions.map((r) => (
            <span key={r} className="text-sm font-semibold text-ink/45 transition-colors hover:text-ink/70">
              {r}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
