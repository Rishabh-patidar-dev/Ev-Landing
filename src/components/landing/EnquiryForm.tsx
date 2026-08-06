'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Building2, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Validation is intentionally off (client demo) — no resolver.
type Data = { name: string; email: string; phone?: string; company?: string; city?: string; message?: string }

function getUtm() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  return {
    utm_source: p.get('utm_source') || undefined,
    utm_medium: p.get('utm_medium') || undefined,
    utm_campaign: p.get('utm_campaign') || undefined,
  }
}

export function EnquiryForm() {
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Data>()

  const onSubmit = async (data: Data) => {
    setServerError(null)
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...getUtm() }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) {
        setServerError(
          typeof result.error === 'string' ? result.error : 'Could not send. Please try again.'
        )
        return
      }
      setDone(true)
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  return (
    <section id="enquiry" className="border-t border-ink/[0.06] bg-sand/10 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            Not ready to apply?
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Talk to our network team
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink/60">
            Tell us a little about you and where you’d like to operate. We’ll reach out
            with the specifics for your city and format — no obligation.
          </p>
          <p className="mt-6 font-mono text-xs text-ink/40">
            Prefer to dive in? You can{' '}
            <a href="/apply" className="text-slate underline">
              apply directly
            </a>{' '}
            — no account needed.
          </p>
        </div>

        <div className="rounded-2xl border border-ink/[0.08] bg-brand-white p-6 shadow-sm sm:p-8">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate/10">
                <CheckCircle2 className="h-7 w-7 text-slate" />
              </span>
              <h3 className="text-xl font-semibold text-ink">Thanks — we’ve got it</h3>
              <p className="max-w-xs text-sm text-ink/60">
                Your details are with our network team. Expect to hear from us shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}
              <Input
                {...register('name')}
                label="Name"
                placeholder="Your name"
                prefix={<User className="h-4 w-4" />}
                error={errors.name?.message}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register('email')}
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  prefix={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  required
                />
                <Input
                  {...register('phone')}
                  label="Mobile"
                  placeholder="9876543210"
                  prefix={<Phone className="h-4 w-4" />}
                  error={errors.phone?.message}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register('company')}
                  label="Company"
                  placeholder="Optional"
                  prefix={<Building2 className="h-4 w-4" />}
                  error={errors.company?.message}
                />
                <Input
                  {...register('city')}
                  label="City"
                  placeholder="Where you'll operate"
                  error={errors.city?.message}
                />
              </div>
              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                Send enquiry
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
