import type { PDFDocumentProxy } from 'pdfjs-dist'

export type PageTextureMeta = {
  canvas: HTMLCanvasElement
  /** Taille d’affichage CSS (px) */
  cssWidth: number
  cssHeight: number
  pageIndex: number
  scaleKey: string
}

type CacheEntry = {
  meta: PageTextureMeta
  lastTouch: number
}

function makeCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.className = 'block max-w-full h-auto'
  return c
}

/**
 * Rendu PDF → canvas mis en cache. Aucune logique d’animation : appeler uniquement
 * hors flip (idle, zoom, resize debouncé, préchargement).
 */
export class PdfPageRenderCache {
  private cache = new Map<string, CacheEntry>()
  private touchSeq = 0
  private inflight = new Map<string, Promise<PageTextureMeta>>()
  private readonly maxEntries: number
  private readonly revision: number

  constructor(maxEntries: number, revision = 0) {
    this.maxEntries = maxEntries
    this.revision = revision
  }

  cacheKey(pageIndex: number, scaleKey: string): string {
    return `${this.revision}:${pageIndex}:${scaleKey}`
  }

  invalidateAll(): void {
    for (const { meta } of this.cache.values()) {
      meta.canvas.width = 0
      meta.canvas.height = 0
    }
    this.cache.clear()
    this.inflight.clear()
  }

  private touchLRU(key: string, entry: CacheEntry): void {
    this.touchSeq += 1
    entry.lastTouch = this.touchSeq
    if (this.cache.size <= this.maxEntries) return
    let oldestKey: string | null = null
    let oldestVal = Infinity
    for (const [k, v] of this.cache) {
      if (k === key) continue
      if (v.lastTouch < oldestVal) {
        oldestVal = v.lastTouch
        oldestKey = k
      }
    }
    if (oldestKey) {
      const dropped = this.cache.get(oldestKey)
      if (dropped) {
        dropped.meta.canvas.width = 0
        dropped.meta.canvas.height = 0
      }
      this.cache.delete(oldestKey)
    }
  }

  get(pageIndex: number, scaleKey: string): PageTextureMeta | undefined {
    return this.cache.get(this.cacheKey(pageIndex, scaleKey))?.meta
  }

  has(pageIndex: number, scaleKey: string): boolean {
    return this.cache.has(this.cacheKey(pageIndex, scaleKey))
  }

  async renderPageToCache(params: {
    doc: PDFDocumentProxy
    pageIndex: number
    scaleKey: string
    cssMaxWidth: number
    zoom: number
    dpr: number
  }): Promise<PageTextureMeta> {
    const { doc, pageIndex, scaleKey, cssMaxWidth, zoom, dpr } = params
    const key = this.cacheKey(pageIndex, scaleKey)
    const hit = this.cache.get(key)
    if (hit) {
      this.touchLRU(key, hit)
      return hit.meta
    }

    const pending = this.inflight.get(key)
    if (pending) return pending

    const task = (async () => {
      const pdfPage = await doc.getPage(pageIndex + 1)
      const baseViewport = pdfPage.getViewport({ scale: 1 })
      const fit = cssMaxWidth / baseViewport.width
      const renderScale = fit * zoom * dpr
      const viewport = pdfPage.getViewport({ scale: renderScale })

      const canvas = makeCanvas()

      const w = Math.floor(viewport.width)
      const h = Math.floor(viewport.height)
      canvas.width = w
      canvas.height = h

      const cssWidth = w / dpr
      const cssHeight = h / dpr
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`

      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) throw new Error('Canvas 2D indisponible')

      const renderTask = pdfPage.render({
        canvasContext: ctx,
        viewport,
        canvas,
      })
      await renderTask.promise

      const meta: PageTextureMeta = { canvas, cssWidth, cssHeight, pageIndex, scaleKey }
      const entry: CacheEntry = { meta, lastTouch: 0 }
      this.cache.set(key, entry)
      this.touchLRU(key, entry)
      return meta
    })()

    this.inflight.set(key, task)
    try {
      return await task
    } finally {
      this.inflight.delete(key)
    }
  }
}
