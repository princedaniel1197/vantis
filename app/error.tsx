'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="text-center">
        <div className="font-mono text-gray text-xs uppercase tracking-widest mb-3">Something went wrong</div>
        <button
          onClick={reset}
          className="text-xs text-gold border border-gold/30 px-4 py-2 rounded-sm hover:bg-gold/10 transition-colors duration-150"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
