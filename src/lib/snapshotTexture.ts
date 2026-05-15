import type { PageTextureMeta } from './pdfPageCache'

/** Copie bitmap une seule fois (hors boucle d’animation) pour éviter deux montages du même canvas. */
export function snapshotTexture(meta: PageTextureMeta): PageTextureMeta {
  const c = document.createElement('canvas')
  c.width = meta.canvas.width
  c.height = meta.canvas.height
  const ctx = c.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas 2D indisponible')
  ctx.drawImage(meta.canvas, 0, 0)
  c.style.width = `${meta.cssWidth}px`
  c.style.height = `${meta.cssHeight}px`
  return {
    canvas: c,
    cssWidth: meta.cssWidth,
    cssHeight: meta.cssHeight,
    pageIndex: meta.pageIndex,
    scaleKey: `${meta.scaleKey}:snap`,
  }
}
