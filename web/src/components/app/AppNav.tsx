'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/components/ui'
import { SignOutButton } from './SignOutButton'

type IconName = 'home' | 'messages' | 'profile' | 'history'

interface NavLink {
  href: string
  label: string
  icon: IconName
}

const NAV_LINKS: NavLink[] = [
  { href: '/app', label: 'Accueil', icon: 'home' },
  { href: '/app/messages', label: 'Messages', icon: 'messages' },
  { href: '/app/profile', label: 'Profil', icon: 'profile' },
  { href: '/app/history', label: 'Historique', icon: 'history' },
]

function NavIcon({ name }: { name: IconName }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-[18px] w-[18px]',
    'aria-hidden': true,
  }
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
        </svg>
      )
    case 'messages':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
        </svg>
      )
    case 'profile':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'history':
      return (
        <svg {...common}>
          <path d="M3 3v5h5" />
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
          <path d="M12 7v5l4 2" />
        </svg>
      )
  }
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-gray-800 bg-neutral-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        {/* Wordmark */}
        <Link
          href="/app"
          className="focus-visible:ring-brand-yellow group mr-1 inline-flex shrink-0 items-center gap-2 rounded-xl px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span className="from-brand-yellow to-brand-yellow-soft flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br font-black text-black shadow-sm">
            B
          </span>
          <span className="text-foreground hidden text-base font-bold tracking-tight sm:inline">
            Binome<span className="text-brand-yellow">Pay</span>
          </span>
        </Link>

        {/* Primary links */}
        <ul className="flex flex-1 items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href)
            const showBadge = link.icon === 'messages' && unreadCount > 0
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3',
                    'focus-visible:ring-brand-yellow outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                    active
                      ? 'bg-brand-yellow/10 text-brand-yellow-soft'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                  )}
                >
                  <span className="relative">
                    <NavIcon name={link.icon} />
                    {showBadge && (
                      <span className="bg-brand-yellow absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* CTA + sign out */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/app/new-intention"
            className={cn(
              'from-brand-yellow to-brand-yellow-soft inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b px-3 py-2 text-sm font-semibold text-black shadow-sm transition-[transform,box-shadow]',
              'hover:shadow-md active:scale-[0.98]',
              'focus-visible:ring-brand-yellow outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">Nouvelle intention</span>
            <span className="sm:hidden">Intention</span>
          </Link>
          <SignOutButton className="hidden lg:inline-flex" />
        </div>
      </nav>
    </header>
  )
}
