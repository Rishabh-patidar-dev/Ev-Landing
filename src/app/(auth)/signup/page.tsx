export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Zap, Check } from 'lucide-react'
import { SignupForm } from '@/components/auth/SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your account — Voltmark Dealers',
  description: 'Create an account to apply for a Voltmark EV dealership.',
}

const points = [
  'Save your progress across all 5 stages',
  'Upload documents securely, once',
  'Track verification and what’s next in real time',
]

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between border-r border-ink/[0.07] bg-sand/10 p-12 lg:flex lg:w-1/2">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone/25">
            <Zap className="h-4 w-4 text-slate" />
          </span>
          <span className="text-base font-semibold text-ink">
            Voltmark <span className="text-slate">Dealers</span>
          </span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-semibold leading-tight text-ink">
            Start your dealership application
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-ink/60">
            One account carries you through the entire onboarding — from KYC to go-live.
          </p>
          <ul className="space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-ink/70">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate/15">
                  <Check className="h-3 w-3 text-slate" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-xs text-ink/35">© 2026 Voltmark</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-brand-white p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate/10">
              <Zap className="h-4 w-4 text-slate" />
            </span>
            <span className="text-sm font-semibold text-ink">Voltmark Dealers</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-ink">Create your account</h2>
            <p className="mt-1 text-sm text-sand">Takes about a minute.</p>
          </div>

          <SignupForm />
        </div>
      </div>
    </div>
  )
}
