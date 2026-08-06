import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { JOURNEY_STAGES } from '@/lib/content/onboarding'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-white pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(0,157,154,0.35), transparent)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(108,92,231,0.25), transparent)' }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: copy */}
        <div className="reveal">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.03] px-3 py-1 font-mono text-xs tracking-wide text-slate">
            <ShieldCheck className="h-3.5 w-3.5" />
            FULLY DIGITAL · 5-STAGE ONBOARDING
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Become an EV dealer
            <br />
            <span className="text-slate">without the paperwork maze.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/60 sm:text-lg">
            Create an account, apply online, and move through verification, site
            assessment, contracts, and training — all tracked in one place. Your
            application lands directly with our network team.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-stone px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-[#00807D]"
            >
              Start your application <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#enquiry"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 px-6 py-3.5 text-base font-medium text-ink transition-colors hover:border-ink/30"
            >
              Talk to our network team
            </a>
          </div>

          <p className="mt-5 font-mono text-xs text-ink/40">
            No commitment to apply · Application fee only at Stage 1
          </p>
        </div>

        {/* Right: signature live-pipeline visual */}
        <div className="reveal reveal-delay">
          <div className="relative rounded-2xl border border-ink/[0.08] bg-white p-5 shadow-xl shadow-ink/5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink/40">
                Your onboarding path
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate/10 px-2 py-0.5 font-mono text-[10px] text-slate">
                <span className="h-1.5 w-1.5 rounded-full bg-slate" /> LIVE
              </span>
            </div>

            <ol className="relative">
              {/* vertical rail */}
              <span
                aria-hidden
                className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-stone via-ink/10 to-ink/5"
              />
              {JOURNEY_STAGES.map((s, i) => (
                <li key={s.n} className="relative flex gap-4 py-2.5">
                  <span
                    className={[
                      'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs',
                      i === 0
                        ? 'bg-stone text-ink stage-pulse'
                        : 'border border-ink/12 bg-brand-white text-ink/40',
                    ].join(' ')}
                  >
                    {s.n}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="truncate text-sm font-medium text-ink">{s.title}</p>
                    <p className="truncate font-mono text-[11px] text-ink/40">{s.dept}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
