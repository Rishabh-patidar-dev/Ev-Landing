'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, User, Mail, Phone } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { validateGSTIN, formatGSTIN } from '@/lib/validators/gstin'
import { validatePAN, formatPAN } from '@/lib/validators/pan'

const registerSchema = z.object({
  promoterName: z.string().min(2, 'Full name required'),
  entityName: z.string().min(2, 'Company name required'),
  email: z.string().email('Valid email required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  cityTier: z.string().min(1, 'Select a city tier'),
  oemId: z.string().optional(),
  gstin: z.string().refine(validateGSTIN, 'Invalid GSTIN — check the 15-character code on your GST certificate'),
  pan: z.string().refine(validatePAN, 'Invalid PAN format'),
  netWorthRange: z.string().min(1, 'Select net worth range'),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: (dealerId: string) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [dealerId, setDealerId] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstin: data.gstin,
          pan: data.pan,
          entityName: data.entityName,
          promoterName: data.promoterName,
          email: data.email,
          mobile: data.mobile,
          cityTier: data.cityTier,
          oemId: data.oemId || undefined,
          netWorthRange: data.netWorthRange,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        setServerError(result.error || 'Registration failed. Please try again.')
        return
      }

      setDealerId(result.dealerId)
      setSubmitted(true)
      onSuccess?.(result.dealerId)
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="space-y-5 py-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5">
          <h3 className="text-xl font-bold text-ink">Application received!</h3>
          <p className="text-sand text-sm">
            Your application is under review. We'll reach out within 2 business days.
          </p>
          {dealerId && (
            <p className="text-xs text-sand/60 mt-1">
              Reference: <span className="font-mono text-ink">{dealerId.split('-')[0].toUpperCase()}</span>
            </p>
          )}
        </div>

        {/* What happens next */}
        <div className="bg-sand/10 rounded-xl p-4 space-y-2.5">
          <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider">What happens next</p>
          <ol className="space-y-2">
            {[
              'Check your inbox — we\'ve sent a link to set up your account password.',
              'Once your password is set, sign in to start your 5-stage onboarding.',
              'If you don\'t receive the email within 5 minutes, check your spam folder.',
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-sand">
                <span className="w-4 h-4 rounded-full bg-slate/20 text-slate text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <a
          href="/login"
          className="block w-full text-center py-2.5 px-4 bg-ink text-brand-white text-sm font-semibold rounded-xl hover:bg-ink2 transition-colors"
        >
          Go to Sign In →
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register('promoterName')}
          label="Promoter Name"
          placeholder="John Doe"
          prefix={<User className="w-4 h-4" />}
          error={errors.promoterName?.message}
          required
        />
        <Input
          {...register('entityName')}
          label="Company Name"
          placeholder="EV Motors Pvt Ltd"
          prefix={<Building2 className="w-4 h-4" />}
          error={errors.entityName?.message}
          required
        />
        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="contact@company.com"
          prefix={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          required
        />
        <Input
          {...register('mobile')}
          label="Mobile Number"
          placeholder="9876543210"
          prefix={<Phone className="w-4 h-4" />}
          error={errors.mobile?.message}
          required
        />
        <Input
          {...register('gstin', {
            onChange: (e) => setValue('gstin', formatGSTIN(e.target.value), { shouldValidate: true })
          })}
          label="GSTIN"
          placeholder="22AAAAA0000A1ZC"
          className="font-mono uppercase"
          error={errors.gstin?.message}
          hint="15-character GST Identification Number — enter exactly as it appears on your GST certificate"
          required
        />
        <Input
          {...register('pan', {
            onChange: (e) => setValue('pan', formatPAN(e.target.value), { shouldValidate: true })
          })}
          label="PAN"
          placeholder="AAAAA1234A"
          className="font-mono"
          error={errors.pan?.message}
          required
        />
        <Select
          {...register('cityTier')}
          label="City Tier"
          placeholder="Select tier"
          options={[
            { value: 'tier1', label: 'Tier 1 (Metro)' },
            { value: 'tier2', label: 'Tier 2 (Major City)' },
            { value: 'tier3', label: 'Tier 3 (Small City)' },
            { value: 'tier4', label: 'Tier 4 (Town)' },
          ]}
          error={errors.cityTier?.message}
          required
        />
        <Select
          {...register('netWorthRange')}
          label="Net Worth Range"
          placeholder="Select range"
          options={[
            { value: '50L-1Cr', label: '₹50L – ₹1 Cr' },
            { value: '1Cr-5Cr', label: '₹1 Cr – ₹5 Cr' },
            { value: '5Cr-20Cr', label: '₹5 Cr – ₹20 Cr' },
            { value: '20Cr+', label: '₹20 Cr+' },
          ]}
          error={errors.netWorthRange?.message}
          required
        />
      </div>

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Submit Application
      </Button>
    </form>
  )
}
