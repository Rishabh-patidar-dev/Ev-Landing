export const dynamic = 'force-dynamic'

import { Zap } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — EV Dealer Platform',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 border-r border-ink/[0.07] bg-sand/10 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone/25 flex items-center justify-center">
            <Zap className="w-4 h-4 text-slate" />
          </div>
          <span className="text-ink font-semibold text-base">
            EV Dealer Hub
          </span>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-ink leading-tight mb-4">
              Streamlined EV dealer onboarding
            </h1>
            <p className="text-ink/60 text-sm leading-relaxed">
              Five stages — KYC, financial due diligence, site assessment, contracts, and staff training — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Automated KYC verification',
              'Geo-tagged site assessment',
              'Aadhaar OTP e-signatures',
              'Staff training & LMS tracking',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate flex-shrink-0" />
                <p className="text-ink/60 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-ink/35 text-xs">© 2026 EV Dealer Hub</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-brand-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md bg-slate/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-slate" />
            </div>
            <span className="font-semibold text-ink text-sm">
              EV Dealer Hub
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-ink mb-1">Sign in</h2>
            <p className="text-sand text-sm">Welcome back to your dealer portal.</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
