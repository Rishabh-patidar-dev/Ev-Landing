import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { Zap, CheckCircle, Mail, Clock } from 'lucide-react'
import { STAGE_CONFIGS } from '@/lib/validators/stage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Application Submitted — EV Dealer Hub' }

export default async function ApplicationCompletePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const dealer = await prisma.dealer.findFirst({
    where: { authId: session.sub },
  })

  if (!dealer) redirect('/register')

  if (dealer.currentStage <= 5) redirect(`/onboarding/${dealer.currentStage}`)

  const refId = dealer.id.split('-')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-[--white] flex flex-col">

      {/* Top bar */}
      <header className="bg-ink">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-stone flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-ink" />
          </div>
          <p className="text-brand-white text-sm font-semibold">EV Dealer Onboarding</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center py-16 px-6">
        <div className="max-w-2xl w-full space-y-8">

          {/* Success hero */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-ink">Application Submitted!</h1>
              <p className="text-sand mt-2 text-base">
                Congratulations, <strong className="text-ink">{dealer.promoterName}</strong>. Your dealership application for{' '}
                <strong className="text-ink">{dealer.entityName}</strong> has been successfully submitted.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-sand/10 rounded-full px-4 py-1.5 text-sm text-sand">
              Reference ID:
              <span className="font-mono font-semibold text-ink">{refId}</span>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-brand-white border border-sand/20 rounded-2xl p-6">
            <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate" /> What happens next?
            </h2>
            <ol className="space-y-3">
              {[
                'Our team will review all 5 stages of your application within 3–5 business days.',
                'You will receive an email notification once your application is approved or if additional information is needed.',
                'Upon approval, you will receive onboarding instructions and your dealer login credentials.',
                'For any queries reach us at support@evdealerhub.in or call 1800-XXX-XXXX.',
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate/10 text-slate text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sand text-sm leading-relaxed">{text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Completed stages summary */}
          <div className="bg-brand-white border border-sand/20 rounded-2xl p-6">
            <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> All 5 Stages Completed
            </h2>
            <div className="space-y-1">
              {STAGE_CONFIGS.map(stage => (
                <div
                  key={stage.stage}
                  className="flex items-center justify-between py-2.5 border-b border-sand/10 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-brand-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-ink">
                      <span className="text-sand/60 mr-1">Stage {stage.stage}:</span>
                      {stage.name}
                    </span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Submitted</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email reminder */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
            <Mail className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              A confirmation email has been sent to <strong>{dealer.email}</strong>. Please check your inbox and spam folder.
            </p>
          </div>

        </div>
      </main>

    </div>
  )
}
