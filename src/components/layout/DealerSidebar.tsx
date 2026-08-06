'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Map,
  FileSignature,
  Users,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'My Progress' },
  { href: '/stage/1', icon: FileText, label: 'KYC & Docs' },
  { href: '/stage/2', icon: TrendingUp, label: 'Financials' },
  { href: '/stage/3', icon: Map, label: 'Site Assessment' },
  { href: '/stage/4', icon: FileSignature, label: 'Contracts' },
  { href: '/stage/5', icon: Users, label: 'Staff & LMS' },
  { href: '/support', icon: HelpCircle, label: 'Support' },
]

interface DealerSidebarProps {
  userEmail: string
}

export function DealerSidebar({ userEmail }: DealerSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside
      className={[
        'flex flex-col bg-ink border-r border-ink2 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      {/* Logo */}
      <div
        className={[
          'flex items-center border-b border-ink2 py-4',
          collapsed ? 'justify-center px-4' : 'gap-2.5 px-4',
        ].join(' ')}
      >
        <div className="w-7 h-7 rounded-md bg-stone/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-stone" />
        </div>
        {!collapsed && (
          <span className="text-brand-white font-semibold text-sm">
            EV Dealer Hub
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-md',
                active
                  ? 'bg-slate/20 text-brand-white'
                  : 'text-sand/60 hover:text-brand-white hover:bg-white/[0.04]',
                collapsed ? 'justify-center' : '',
              ].join(' ')}
            >
              <Icon
                className={[
                  'flex-shrink-0',
                  active ? 'text-stone' : 'text-sand/40',
                ].join(' ')}
                size={16}
              />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-ink2 p-3 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-[11px] text-sand/40 truncate">{userEmail}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={[
            'flex items-center gap-2 w-full px-3 py-2 text-sm text-sand/50 hover:text-red-400 hover:bg-white/[0.03] rounded-md transition-colors cursor-pointer',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={14} className="flex-shrink-0" />
          {!collapsed && (loggingOut ? 'Signing out…' : 'Sign out')}
        </button>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center w-full py-1.5 text-sand/30 hover:text-sand/60 cursor-pointer transition-colors rounded-md"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>
      </div>
    </aside>
  )
}
