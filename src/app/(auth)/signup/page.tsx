export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { SignupForm } from '@/components/auth/SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your account — Luxus Green Onboarding Portal',
  description: 'Create an account to track your Luxus Green Mobility dealership application stage by stage.',
}

const points = [
  'Save your progress across all 5 stages',
  'Upload documents securely, once',
  'Track verification and what’s next in real time',
]

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-col justify-between border-r border-ink/[0.07] bg-mint/50 p-12 lg:flex lg:w-1/2">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Image src="/luxus-green-logo.webp" alt="Luxus Green Mobility" width={20} height={20} className="object-contain" />
          </span>
          <span className="text-base font-semibold text-ink">
            Luxus Green <span className="text-slate">Onboarding Portal</span>
          </span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-semibold leading-tight text-ink">
            Track your dealership application
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-ink/60">
            One account carries you through all 5 stages — from KYC to go-live —
            with document upload at each step.
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

        <p className="font-mono text-xs text-ink/35">© 2026 Luxus Green Mobility</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-brand-white p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-mint">
              <Image src="/luxus-green-logo.webp" alt="Luxus Green Mobility" width={16} height={16} className="object-contain" />
            </span>
            <span className="text-sm font-semibold text-ink">Luxus Green Onboarding Portal</span>
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
