'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, KeyRound, Lock, Mail, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { crmFetch } from '@/lib/crm/dealerAuth'

// Validation is intentionally off (client demo) — no resolver, so
// react-hook-form never blocks submission on field content.
type Data = { fullName: string; email: string; username: string; password: string; confirm: string }

export function SignupForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Data>()

  const onSubmit = async (data: Data) => {
    setServerError(null)
    const { ok, data: result } = await crmFetch('/api/v1/dealer-auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: data.username, password: data.password, fullName: data.fullName, email: data.email }),
    })
    if (!ok || !result.ok) {
      setServerError(result.message || 'Could not create your account.')
      return
    }
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>
      )}

      <Input {...register('fullName')} label="Full name" placeholder="Your name" prefix={<User className="h-4 w-4" />} error={errors.fullName?.message} required />
      <Input {...register('email')} label="Email" type="email" placeholder="you@company.com" prefix={<Mail className="h-4 w-4" />} error={errors.email?.message} required />
      <Input {...register('username')} label="Username" placeholder="Choose a username" prefix={<KeyRound className="h-4 w-4" />} error={errors.username?.message} required />
      <Input {...register('password')} label="Password" type="password" placeholder="At least 8 characters" prefix={<Lock className="h-4 w-4" />} error={errors.password?.message} required />
      <Input {...register('confirm')} label="Confirm password" type="password" placeholder="Re-enter your password" prefix={<Lock className="h-4 w-4" />} error={errors.confirm?.message} required />

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Create account <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-center text-sm text-sand">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-slate hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
