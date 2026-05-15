import { useLayoutEffect, useRef } from 'react'
import type { PageTextureMeta } from '../../lib/pdfPageCache'

type TextureMountProps = {
  meta: PageTextureMeta
  className?: string
}

/** Monte le canvas du cache dans le DOM (une seule instance à la fois). */
export function TextureMount({ meta, className = '' }: TextureMountProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    while (el.firstChild) el.removeChild(el.firstChild)
    el.appendChild(meta.canvas)
    return () => {
      try {
        el.removeChild(meta.canvas)
      } catch {
        /* déjà déplacé */
      }
    }
  }, [meta])

  return (
    <div
      ref={ref}
      className={`overflow-hidden rounded-sm bg-white shadow-inner ${className}`}
      style={{ width: meta.cssWidth, height: meta.cssHeight }}
    />
  )
}
