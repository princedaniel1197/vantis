import { ThemeProvider } from '@/app/context/ThemeContext'
import DevTopBar from '@/components/dev/DevTopBar'
import DevAssistant from '@/components/dev/DevAssistant'

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-bg text-ink font-sans">
        <DevTopBar />
        <main className="pt-14">
          {children}
        </main>
        <DevAssistant />
      </div>
    </ThemeProvider>
  )
}
