export const dynamic = 'force-dynamic'

import { Zap } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply as EV Dealer — EV Dealer Hub',
  description:
    'Start your journey to becoming a certified EV dealer. 5-stage onboarding with automated KYC.',
}

const features = [
  {
    title: 'Auto-KYC Verification',
    description: 'Aadhaar, PAN, GSTIN & bank account verification in minutes.',
  },
  {
    title: 'Geo-Tagged Site Assessment',
    description: 'GPS-validated site photos with EXIF data extraction.',
  },
  {
    title: 'E-Signatures via Aadhaar OTP',
    description: 'Legally binding contracts signed digitally through Leegality.',
  },
  {
    title: 'Financial Due Diligence',
    description: 'Automated net worth & bank statement analysis via Perfios.',
  },
  {
    title: 'Staff Training & LMS',
    description: 'Track certifications and training completion for your team.',
  },
  {
    title: 'ACID-Safe Stage Transitions',
    description: 'Every stage advance is atomic — no partial states, no data loss.',
  },
]

const steps = [
  { num: 1, title: 'KYC & Entity', desc: 'Aadhaar, PAN, GSTIN verification', dept: 'Compliance' },
  { num: 2, title: 'Financial Check', desc: 'Balance sheets, ITR, bank statements', dept: 'Finance' },
  { num: 3, title: 'Site Assessment', desc: 'Geo-tagged photos & floor plans', dept: 'Infrastructure' },
  { num: 4, title: 'Agreements', desc: 'LOI, Dealer Agreement, NDA', dept: 'Legal' },
  { num: 5, title: 'Training & Go-Live', desc: 'LMS certification & safety checklist', dept: 'Operations' },
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-brand-white">
      {/* Header */}
      <header className="bg-ink px-6 py-4 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-stone/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-stone" />
            </div>
            <span className="text-brand-white font-semibold text-sm">
              EV Dealer Hub
            </span>
          </div>
          <Link
            href="/login"
            className="text-sand/60 text-sm hover:text-sand transition-colors"
          >
            Already a dealer? Sign in →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-ink px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-stone text-sm font-medium mb-3 uppercase tracking-wider">
            5-Stage Onboarding
          </p>
          <h1 className="text-4xl font-bold text-brand-white mb-4 leading-tight">
            Apply to become an EV dealer
          </h1>
          <p className="text-sand/70 text-base max-w-xl mx-auto">
            A fully digital onboarding process — from KYC to go-live. Automated verification, e-signatures, and real-time tracking.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-ink mb-6">
            Start your application
          </h2>
          <div className="bg-brand-white rounded-xl border border-ink/[0.08] shadow-sm p-8">
            <RegisterForm />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-12 border-t border-ink/[0.06] bg-sand/[0.04]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-ink mb-8">
            What's included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ title, description }) => (
              <div key={title} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ink mb-0.5">{title}</p>
                  <p className="text-sm text-sand/80">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-12 bg-ink">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-brand-white mb-8">
            How it works
          </h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate/20 flex items-center justify-center text-stone font-bold text-sm flex-shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-brand-white text-sm">{step.title}</h3>
                    <span className="text-xs text-sand/40">{step.dept}</span>
                  </div>
                  <p className="text-sand/60 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink2 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-sand/30 text-xs">© 2026 EV Dealer Hub</p>
        </div>
      </footer>
    </div>
  )
}
