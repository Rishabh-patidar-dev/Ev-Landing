'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowUpRight } from 'lucide-react'

const links = [
  { href: '#process', label: 'How it works' },
  { href: '#requirements', label: 'Requirements' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-5 sm:px-5">
      <nav
        className={[
          'mx-auto flex max-w-5xl items-center justify-between rounded-full border px-4 py-2.5 transition-shadow duration-300 sm:px-5',
          scrolled ? 'border-ink/[0.06] bg-brand-white/95 shadow-[0_8px_30px_rgba(11,23,16,0.08)] backdrop-blur-md' : 'border-ink/[0.05] bg-brand-white/80 backdrop-blur-sm',
        ].join(' ')}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint">
            <Image src="/luxus-green-logo.webp" alt="Luxus Green Mobility" width={18} height={18} className="object-contain" />
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-ink">
            Luxus Green <span className="text-slate">Onboarding</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink/60 transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-sm font-medium text-ink/60 transition-colors hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/apply"
            className="group flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-brand-white transition-colors hover:bg-slate"
          >
            Apply now
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone text-ink transition-transform group-hover:rotate-45">
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-5xl rounded-3xl border border-ink/[0.06] bg-brand-white/95 px-5 py-4 shadow-[0_8px_30px_rgba(11,23,16,0.08)] backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm text-ink/60 hover:bg-ink/[0.04] hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3">
              <Link href="/login" className="flex-1 rounded-full border border-ink/15 px-4 py-2.5 text-center text-sm font-medium text-ink">
                Sign in
              </Link>
              <Link href="/apply" className="flex-1 rounded-full bg-ink px-4 py-2.5 text-center text-sm font-semibold text-brand-white">
                Apply now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
