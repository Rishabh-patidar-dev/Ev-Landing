import { FileText, IndianRupee } from 'lucide-react'
import { JOURNEY_STAGES } from '@/lib/content/onboarding'

export function ProcessRail() {
  return (
    <section id="process" className="bg-brand-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-mint px-3.5 py-1.5 font-mono text-xs font-medium tracking-widest text-slate">
            THE PATH TO GO-LIVE
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Five stages, one connected pipeline
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/60">
            Each stage has a clear owner, a defined checklist, and a known cost — so
            you always know what’s next and what it takes. You only commit capital as
            you advance.
          </p>
        </div>

        <ol className="relative">
          {/* Connecting rail */}
          <span
            aria-hidden
            className="absolute left-[19px] top-4 bottom-4 hidden w-px bg-gradient-to-b from-stone via-slate/40 to-ink/10 sm:block"
          />

          {JOURNEY_STAGES.map((s, i) => (
            <li key={s.n} className="relative sm:pl-16">
              {/* Node */}
              <span
                aria-hidden
                className={[
                  'absolute left-0 top-0 z-10 hidden h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-semibold sm:flex',
                  i === 0 ? 'bg-stone text-white' : 'border border-ink/12 bg-brand-white text-ink/50',
                ].join(' ')}
              >
                {s.n}
              </span>

              <div className="mb-6 rounded-2xl border border-ink/[0.07] bg-brand-white p-6 transition-all hover:-translate-y-0.5 hover:border-stone/25 hover:shadow-[0_20px_40px_-24px_rgba(11,23,16,0.2)]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink font-mono text-xs text-brand-white sm:hidden">
                    {s.n}
                  </span>
                  <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                  <span className="rounded-full bg-slate/10 px-2.5 py-0.5 font-mono text-[11px] text-slate">
                    {s.dept}
                  </span>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">{s.blurb}</p>

                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/40">
                      <FileText className="h-3.5 w-3.5" /> Key documents
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.docs.map((d) => (
                        <span
                          key={d}
                          className="rounded-md bg-sand/15 px-2.5 py-1 text-xs text-ink/70"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-mint px-3.5 py-2 text-slate">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs">{s.cost}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
