'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Verify Text', href: '/verify', icon: '✓' },
  { name: 'API Keys', href: '/keys', icon: '🔑' },
  { name: 'Usage', href: '/usage', icon: '📈' },
  { name: 'Documentation', href: '/docs', icon: '📖' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-neutral-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <h1 className="text-xl font-bold">Verify</h1>
        <p className="text-sm text-neutral-400">AI Detection API</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800">
        <div className="text-xs text-neutral-500">
          v0.1.0 • MVP Build
        </div>
      </div>
    </div>
  )
}