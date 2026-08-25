export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { ApplicationWizard } from '@/components/apply/ApplicationWizard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply for a dealership — Luxus Green Onboarding Portal',
  description: 'Submit your EV dealership application to the Luxus Green Mobility network.',
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-brand-white">
      <header className="border-b border-ink/[0.07] bg-brand-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <Image src="/luxus-green-logo.webp" alt="Luxus Green Mobility" width={20} height={20} className="object-contain" />
            </span>
            <span className="text-sm font-semibold text-ink">
              Luxus Green <span className="text-slate">Onboarding Portal</span>
            </span>
          </Link>
        </div>
      </header>

      <section className="px-5 py-12 sm:py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            Stage 1 · Application & E-KYC
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            Apply for a dealership
          </h1>
          <p className="mt-3 text-sm text-ink/60">
            A few details to get started. You can attach documents now or later.
          </p>
        </div>
        <ApplicationWizard />
      </section>
    </div>
  )
}
