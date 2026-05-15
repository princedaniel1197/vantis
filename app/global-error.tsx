'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <button onClick={reset} style={{ color: '#C9A84C', fontSize: '12px', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
