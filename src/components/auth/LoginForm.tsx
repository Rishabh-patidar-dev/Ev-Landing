'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { KeyRound, Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const loginSchema = z.object({
  username: z.string().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [remember, setRemember] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, remember }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) {
        setServerError(typeof result.error === 'string' ? result.error : 'Invalid username or password')
        return
      }
      const role = result.user?.role
      // Full navigation — the (dealer)/(oem) layouts read the session fresh
      // on load and do their own role-based redirect from here.
      window.location.href = role === 'oem_admin' || role === 'super_admin' ? '/oem/dashboard' : '/onboarding/1'
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register('username')}
          label="Username"
          placeholder="Your username"
          prefix={<KeyRound className="w-4 h-4" />}
          error={errors.username?.message}
          required
        />
        <Input
          {...register('password')}
          label="Password"
          type="password"
          placeholder="••••••••"
          prefix={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          required
        />

        <label className="flex select-none items-center gap-2 text-sm text-sand">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 rounded-sm accent-slate"
          />
          Keep me signed in on this device
        </label>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-sand">
        New dealer?{' '}
        <Link href="/register" className="text-slate font-medium hover:underline">
          Apply now
        </Link>
      </p>
    </div>
  )
}
