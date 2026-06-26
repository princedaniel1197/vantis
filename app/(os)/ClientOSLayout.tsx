'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/app/context/ThemeContext'
import OSNav from '@/components/os/OSNav'
import OSAssistant from '@/components/os/OSAssistant'
import ProductChatbot from '@/components/shared/ProductChatbot'

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
        {/* Route-scoped chatbot: Connect pages get Connect intelligence, all others get Build */}
        <ProductChatbot
          product={pathname.startsWith('/connect') ? 'connect' : 'build'}
          title={pathname.startsWith('/connect') ? 'Vantis Connect AI' : 'Vantis Build AI'}
          subtitle={pathname.startsWith('/connect') ? 'Broker & Buyer Intelligence' : 'Developer Intelligence'}
        />
      </div>
    </ThemeProvider>
  )
}
