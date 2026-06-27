'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider, useTheme } from '@/app/context/ThemeContext'
import OSNav from '@/components/os/OSNav'
import OSAssistant from '@/components/os/OSAssistant'
import ProductChatbot from '@/components/shared/ProductChatbot'

function OSLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const pathname = usePathname()
  return (
    <div
      data-theme={theme === 'pitch' ? 'void' : 'daylight'}
      className="min-h-screen bg-background text-ink font-sans"
    >
      <OSNav />
      <main className="pt-14">{children}</main>
      <OSAssistant />
      <ProductChatbot
        product={pathname.startsWith('/connect') ? 'connect' : 'build'}
        title={pathname.startsWith('/connect') ? 'Vantis Connect AI' : 'Vantis Build AI'}
        subtitle={pathname.startsWith('/connect') ? 'Broker & Buyer Intelligence' : 'Developer Intelligence'}
      />
    </div>
  )
}

export default function ClientOSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/') {
    return <>{children}</>
  }

  return (
    <ThemeProvider>
      <OSLayoutInner>{children}</OSLayoutInner>
    </ThemeProvider>
  )
}
