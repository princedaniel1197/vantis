import { ThemeProvider } from '@/app/context/ThemeContext'
import OSNav from '@/components/os/OSNav'
import OSAssistant from '@/components/os/OSAssistant'

export default function OSLayout({ children }: { children: React.ReactNode }) {
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
