'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/app/context/ThemeContext'
import OSNav from '@/components/os/OSNav'
import OSAssistant from '@/components/os/OSAssistant'

export default function ClientOSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hub page — render bare, no OS chrome
  if (pathname === '/') {
    return <>{children}</>
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-bg text-ink font-sans">
        <OSNav />
        <main className="pt-14">{children}</main>
        <OSAssistant />
      </div>
    </ThemeProvider>
  )
}
