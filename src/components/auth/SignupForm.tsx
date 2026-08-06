'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, KeyRound, Lock, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    username: z.string().min(3, 'At least 3 characters').max(50),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type SignupData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupData) => {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: data.fullName, username: data.username, password: data.password }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) {
        setServerError(typeof result.error === 'string' ? result.error : 'Could not create your account.')
        return
      }
      router.push('/apply')
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <Input
        {...register('fullName')}
        label="Full name"
        placeholder="Your name"
        prefix={<User className="h-4 w-4" />}
        error={errors.fullName?.message}
        required
      />
      <Input
        {...register('username')}
        label="Username"
        placeholder="Choose a username"
        prefix={<KeyRound className="h-4 w-4" />}
        error={errors.username?.message}
        required
      />
      <Input
        {...register('password')}
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        prefix={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        required
      />
      <Input
        {...register('confirm')}
        label="Confirm password"
        type="password"
        placeholder="Re-enter your password"
        prefix={<Lock className="h-4 w-4" />}
        error={errors.confirm?.message}
        required
      />

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Create account <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-center text-sm text-sand">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-slate hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
