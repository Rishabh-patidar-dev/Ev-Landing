'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Zap, LayoutDashboard, Users, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'

const navItems = [
  { href: '/oem/dashboard', icon: LayoutDashboard, label: 'Dealer Pipeline' },
  { href: '/oem/dealers', icon: Users, label: 'All Dealers' },
  { href: '/oem/settings', icon: Settings, label: 'Settings' },
]

interface OEMSidebarProps {
  username: string
  role: string
}

export function OEMSidebar({ username, role }: OEMSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="flex flex-col w-60 bg-ink border-r border-ink2">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-ink2">
        <div className="w-8 h-8 bg-stone rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-ink" />
        </div>
        <div>
          <span className="text-brand-white font-bold text-sm block">EV Dealer Hub</span>
          <Badge variant="info" size="sm">{role === 'super_admin' ? 'Super Admin' : 'OEM Admin'}</Badge>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active ? 'bg-slate/30 text-brand-white' : 'text-sand hover:bg-ink2 hover:text-brand-white',
              ].join(' ')}
            >
              <Icon className={active ? 'text-stone' : 'text-sand'} size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-ink2 p-3 space-y-2">
        <div className="px-2 py-2">
          <p className="text-xs text-sand/60 truncate">{username}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-sand hover:bg-red-900/20 hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
