import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Rocket } from 'lucide-react'

// The reference layout's mid-page dark banner — moved up in the page order
// (after WhyPartner) rather than sitting at the very bottom, matching where
// it sits in the reference. PreFooterCTA below covers the reference's
// second, lighter CTA moment right above the footer.
export function DarkCTABanner() {
  return (
    <section className="px-5 py-10 sm:py-14">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-8 py-14 sm:px-14 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(22,163,74,0.55), transparent)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-xs font-medium tracking-widest text-stone">
              LET&rsquo;S GET YOU LIVE
            </span>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-brand-white sm:text-4xl">
              Ready to put your name on the network?
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-brand-white/60">
              Apply and start Stage 1 today. It takes a few minutes, and you can
              attach documents right away or add them later.
            </p>
            <div className="mt-8">
              <Link
                href="/apply"
                className="group inline-flex items-center gap-2.5 rounded-full bg-stone py-2.5 pl-6 pr-2.5 text-base font-semibold text-white transition-colors hover:bg-stone-dark"
              >
                Start your application
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>

          {/* Decorative mark echoing the reference's illustration slot — a
              glowing ring around a rocket, standing in for "going live". */}
          <div aria-hidden className="relative hidden h-40 w-40 shrink-0 items-center justify-center lg:flex">
            <span className="absolute inset-0 rounded-full border border-dashed border-white/15" />
            <span className="absolute inset-6 rounded-full bg-white/[0.06]" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-stone shadow-[0_0_60px_rgba(22,163,74,0.5)]">
              <Rocket className="h-9 w-9 text-white" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Lighter, slimmer CTA strip right above the footer — the reference
// layout's second CTA moment, kept much quieter than the dark banner above
// so it reads as a final nudge, not a repeat of the same pitch.
export function PreFooterCTA() {
  return (
    <section className="px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 rounded-2xl bg-mint px-6 py-6 sm:flex-row sm:px-8">
        <p className="text-center text-base font-medium text-ink sm:text-left">
          Have questions before you commit? <span className="text-ink/60">Our network team is one message away.</span>
        </p>
        <a
          href="#enquiry"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate"
        >
          Talk to us
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </section>
  )
}

const footerColumns = [
  {
    heading: 'About',
    links: [
      { label: 'How it works', href: '#process' },
      { label: 'Requirements', href: '#requirements' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    heading: 'Get started',
    links: [
      { label: 'Apply now', href: '/apply' },
      { label: 'Sign in', href: '/login' },
      { label: 'Talk to network team', href: '#enquiry' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-ink/[0.06] bg-brand-white pt-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint">
                <Image src="/luxus-green-logo.webp" alt="Luxus Green Mobility" width={18} height={18} className="object-contain" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-ink">
                Luxus Green <span className="text-slate">Onboarding</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/50">
              A fully digital path from application to go-live for Luxus Green Mobility&rsquo;s EV dealer network.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ink/40">{col.heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-ink/60 transition-colors hover:text-ink">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* "Newsletter"-style slot from the reference — routed to the real
              working enquiry form below instead of a second, fake capture
              mechanism, so nothing here pretends to submit anything on its
              own. */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink/40">Talk to us</h4>
            <p className="mt-4 text-sm leading-relaxed text-ink/50">
              Not ready to apply? Send your details to our network team instead.
            </p>
            <a
              href="#enquiry"
              className="group mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate"
            >
              Contact network team
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/[0.06] py-6 sm:flex-row">
          <p className="font-mono text-xs text-ink/35">© 2026 Luxus Green Mobility. All rights reserved.</p>
          <p className="font-mono text-xs text-ink/35">Made for dealers, by the network team.</p>
        </div>
      </div>
    </footer>
  )
}
