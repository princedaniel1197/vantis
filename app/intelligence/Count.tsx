'use client'

import { useEffect, useRef, useState } from 'react'

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export default function Count({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [v, setV] = useState(0)
  const started = useRef<number | null>(null)
  useEffect(() => {
    let raf = 0
    const tick = (now: number) => {
      if (started.current == null) started.current = now
      const p = Math.min(1, (now - started.current) / duration)
      setV(Math.round(to * easeOutCubic(p)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <>{v}</>
}
