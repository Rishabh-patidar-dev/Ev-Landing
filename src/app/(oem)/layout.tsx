import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { OEMSidebar } from '@/components/layout/OEMSidebar'
import type { ReactNode } from 'react'

export default async function OEMLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role !== 'oem_admin' && session.role !== 'super_admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-sand/5">
      <OEMSidebar username={session.username} role={session.role} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
