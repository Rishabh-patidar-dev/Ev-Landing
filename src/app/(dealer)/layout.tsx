import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import type { ReactNode } from 'react'

export default async function DealerLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role === 'oem_admin' || session.role === 'super_admin') {
    redirect('/oem/dashboard')
  }

  return <>{children}</>
}
