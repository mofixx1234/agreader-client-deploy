import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const MIN_VISIBLE_MS = 320
const FADE_MS = 280

function BookMark() {
  return (
    <div
      className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/95 bg-white/10 shadow-lg backdrop-blur-[2px]"
      aria-hidden
    >
      <svg
        className="h-11 w-11 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M12 6v10" />
      </svg>
    </div>
  )
}

export function NavigationLoadingOverlay() {
  const location = useLocation()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const prevKeyRef = useRef<string | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (prevKeyRef.current === null) {
      prevKeyRef.current = location.key
      return
    }
    if (prevKeyRef.current === location.key) return
    prevKeyRef.current = location.key

    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }

    const started = performance.now()
    setMounted(true)
    requestAnimationFrame(() => setVisible(true))

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const elapsed = performance.now() - started
        const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)
        hideTimer.current = setTimeout(() => setVisible(false), wait)
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
        hideTimer.current = null
      }
    }
  }, [location.key])

  if (!mounted) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={visible}
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity ease-out"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        opacity: visible ? 1 : 0,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName !== 'opacity') return
        if (!visible) setMounted(false)
      }}
    >
      <span className="sr-only">Chargement de la page…</span>
      <BookMark />
    </div>
  )
}
