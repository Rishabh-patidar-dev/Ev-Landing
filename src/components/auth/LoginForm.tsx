'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { KeyRound, Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { crmFetch } from '@/lib/crm/dealerAuth'

// Validation is intentionally off (client demo) — no resolver.
type Data = { username: string; password: string }

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Data>()

  const onSubmit = async (data: Data) => {
    setServerError(null)
    const { ok, data: result } = await crmFetch('/api/v1/dealer-auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!ok || !result.ok) {
      console.error('[LoginForm] login failed:', result)
      setServerError(result.message || 'Invalid username or password')
      return
    }
    // Full navigation, not router.push — the freshly-set dealer_session
    // cookie needs to be present for /dashboard's own data fetch right
    // after this, and a hard navigation guarantees that request happens
    // from a clean page load rather than a client-side transition that
    // could theoretically race with cookie commit in some browsers.
    window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>
      )}

      <Input {...register('username')} label="Username" placeholder="Your username" prefix={<KeyRound className="h-4 w-4" />} error={errors.username?.message} required />
      <Input {...register('password')} label="Password" type="password" placeholder="••••••••" prefix={<Lock className="h-4 w-4" />} error={errors.password?.message} required />

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Sign in
      </Button>

      <p className="text-center text-sm text-sand">
        New dealer?{' '}
        <Link href="/signup" className="text-slate font-medium hover:underline">Create an account</Link>
      </p>
    </form>
  )
}
