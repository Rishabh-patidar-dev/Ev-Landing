import Link from 'next/link'
import { ArrowRight, ShieldCheck, ListChecks, IndianRupee, MapPinned } from 'lucide-react'
import { JOURNEY_STAGES } from '@/lib/content/onboarding'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-white pt-36 pb-20 sm:pt-44 sm:pb-28">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[560px] w-[560px] rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(22,163,74,0.22), transparent)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(22,163,74,0.15), transparent)' }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: copy */}
        <div className="reveal">
          <span className="inline-flex items-center gap-2 rounded-full bg-mint px-3.5 py-1.5 font-mono text-xs font-medium tracking-wide text-slate">
            <ShieldCheck className="h-3.5 w-3.5" />
            FULLY DIGITAL · 5-STAGE ONBOARDING
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Become an EV dealer
            <br />
            <span className="relative inline-block text-stone">
              without the paperwork maze.
              <svg
                aria-hidden
                viewBox="0 0 320 18"
                className="absolute -bottom-2 left-0 h-3 w-full text-stone/70"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 12.5C48 4 96 2 160 6.5S288 15 318 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/60 sm:text-lg">
            Create an account, apply online, and move through verification, site
            assessment, contracts, and training — all tracked in one place. Your
            application lands directly with our network team.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-ink pl-6 pr-2.5 py-2.5 text-base font-semibold text-brand-white transition-colors hover:bg-slate"
            >
              Start your application
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone text-ink transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <a
              href="#enquiry"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-base font-medium text-ink transition-colors hover:border-ink/30"
            >
              Talk to our network team
            </a>
          </div>

          <p className="mt-5 font-mono text-xs text-ink/40">
            No commitment to apply · Application fee only at Stage 1
          </p>
        </div>

        {/* Right: signature live-pipeline visual, with floating stat badges
            echoing the reference layout's orbiting icon chips — drawn from
            real onboarding facts rather than decoration for its own sake. */}
        <div className="reveal reveal-delay relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[2.5rem] border border-dashed border-stone/25 sm:-inset-10"
          />

          <div className="relative rotate-[-1.2deg] rounded-3xl border border-ink/[0.07] bg-white p-5 shadow-[0_30px_60px_-20px_rgba(11,23,16,0.18)]">
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
                        ? 'bg-stone text-white stage-pulse'
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

          {/* Floating badges */}
          <div className="float-bob absolute -left-6 top-6 hidden items-center gap-2 rounded-full border border-ink/[0.06] bg-white py-2 pl-2 pr-3.5 shadow-lg shadow-ink/5 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-slate">
              <ListChecks className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-ink">5 stages, fully online</span>
          </div>
          <div className="float-bob float-bob-delay absolute -right-4 top-1/3 hidden items-center gap-2 rounded-full border border-ink/[0.06] bg-white py-2 pl-2 pr-3.5 shadow-lg shadow-ink/5 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone text-white">
              <IndianRupee className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-ink">₹0 to create an account</span>
          </div>
          <div className="float-bob float-bob-delay-2 absolute -bottom-6 left-8 hidden items-center gap-2 rounded-full border border-ink/[0.06] bg-white py-2 pl-2 pr-3.5 shadow-lg shadow-ink/5 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-slate">
              <MapPinned className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-ink">3 city tiers supported</span>
          </div>
        </div>
      </div>
    </section>
  )
}
