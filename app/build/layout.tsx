import type { ReactNode } from 'react'

export default function BuildLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-off-white">{children}</div>
}
