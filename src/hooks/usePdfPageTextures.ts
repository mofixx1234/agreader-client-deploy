import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { loadPdf } from '../lib/pdfDocument'
import { PdfPageRenderCache, type PageTextureMeta } from '../lib/pdfPageCache'
import { useDebouncedValue } from '../lib/useDebouncedValue'

const PREFETCH_K = 2
const MAX_CACHE = 24

export type UsePdfPageTexturesOptions = {
  pdfUrl: string
  /** Largeur utile du conteneur (px) pour adapter le rendu */
  cssMaxWidth: number
  zoom: number
  currentPage: number
}

export function usePdfPageTextures({
  pdfUrl,
  cssMaxWidth,
  zoom,
  currentPage,
}: UsePdfPageTexturesOptions) {
  const [numPages, setNumPages] = useState(0)
  const [textureVersion, setTextureVersion] = useState(0)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [docReady, setDocReady] = useState(false)

  const docRef = useRef<PDFDocumentProxy | null>(null)
  const cacheRef = useRef(new PdfPageRenderCache(MAX_CACHE))
  const cacheGenerationRef = useRef(0)

  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1
  const debouncedWidth = useDebouncedValue(Math.max(120, cssMaxWidth), 200)
  const scaleKey = useMemo(
    () => `${Math.round(zoom * 100)}:${Math.round(debouncedWidth)}`,
    [zoom, debouncedWidth],
  )

  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    setDocReady(false)
    setNumPages(0)
    cacheGenerationRef.current += 1
    const gen = cacheGenerationRef.current
    cacheRef.current.invalidateAll()
    const prev = docRef.current
    docRef.current = null
    void prev?.destroy().catch(() => {})

    const loading = loadPdf(pdfUrl)
    loading.promise
      .then((doc) => {
        if (cancelled || gen !== cacheGenerationRef.current) {
          void doc.destroy()
          return
        }
        docRef.current = doc
        setNumPages(doc.numPages)
        setDocReady(true)
        setTextureVersion((v) => v + 1)
      })
      .catch((e: unknown) => {
        if (!cancelled && gen === cacheGenerationRef.current) {
          setLoadError(e instanceof Error ? e : new Error(String(e)))
        }
      })

    return () => {
      cancelled = true
    }
  }, [pdfUrl])

  const bump = useCallback(() => {
    setTextureVersion((v) => v + 1)
  }, [])

  useEffect(() => {
    const doc = docRef.current
    if (!doc || !docReady || numPages === 0) return

    const indices: number[] = []
    for (let i = currentPage - PREFETCH_K; i <= currentPage + PREFETCH_K; i++) {
      if (i >= 0 && i < numPages) indices.push(i)
    }

    let cancelled = false
    void (async () => {
      let anyNew = false
      for (const pageIndex of indices) {
        if (cancelled) break
        const d = docRef.current
        if (!d) break
        const had = cacheRef.current.has(pageIndex, scaleKey)
        try {
          await cacheRef.current.renderPageToCache({
            doc: d,
            pageIndex,
            scaleKey,
            cssMaxWidth: debouncedWidth,
            zoom,
            dpr,
          })
          if (!had) anyNew = true
        } catch {
          /* page isolée : on continue */
        }
      }
      if (!cancelled && anyNew) bump()
    })()

    return () => {
      cancelled = true
    }
  }, [docReady, numPages, currentPage, scaleKey, debouncedWidth, zoom, dpr, bump])

  const getTexture = useCallback(
    (pageIndex: number): PageTextureMeta | undefined => {
      return cacheRef.current.get(pageIndex, scaleKey)
    },
    [scaleKey, textureVersion],
  )

  const hasTexture = useCallback(
    (pageIndex: number) => cacheRef.current.has(pageIndex, scaleKey),
    [scaleKey, textureVersion],
  )

  return {
    numPages,
    docReady,
    loadError,
    scaleKey,
    textureVersion,
    getTexture,
    hasTexture,
  }
}
