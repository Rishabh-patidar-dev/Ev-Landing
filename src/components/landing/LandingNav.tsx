'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, Menu, X } from 'lucide-react'

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
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'bg-brand-white/90 backdrop-blur-md border-b border-ink/[0.06]' : 'bg-transparent',
      ].join(' ')}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-stone/25">
            <Zap className="h-4 w-4 text-slate" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Voltmark <span className="text-slate">Dealers</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink/60 transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-ink/60 transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/apply"
            className="rounded-md bg-stone px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#00807D]"
          >
            Apply now
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/[0.06] bg-brand-white/95 px-5 py-4 md:hidden">
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
              <Link
                href="/login"
                className="flex-1 rounded-md border border-ink/15 px-4 py-2.5 text-center text-sm font-medium text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/apply"
                className="flex-1 rounded-md bg-stone px-4 py-2.5 text-center text-sm font-semibold text-ink"
              >
                Apply now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
