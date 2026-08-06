import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-ink/[0.06] bg-sand/10 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(0,157,154,0.4), transparent)' }}
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Ready to put your name on the network?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink/60">
          Create your account and start Stage 1 today. It takes a few minutes, and
          you’ll always see exactly what’s next.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-stone px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-[#00807D]"
          >
            Create your account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-ink/15 px-7 py-3.5 text-base font-medium text-ink transition-colors hover:border-ink/30"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-ink/[0.07] bg-brand-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone/25">
            <Zap className="h-3.5 w-3.5 text-slate" />
          </span>
          <span className="text-sm font-semibold text-ink">
            Voltmark <span className="text-slate">Dealers</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/50">
          <a href="#process" className="hover:text-ink">How it works</a>
          <a href="#requirements" className="hover:text-ink">Requirements</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
          <Link href="/login" className="hover:text-ink">Sign in</Link>
        </div>
        <p className="font-mono text-xs text-ink/40">© 2026 Voltmark</p>
      </div>
    </footer>
  )
}
