import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
  PrinterIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

import type { DocumentPage } from '../api/services/document.service'
import type {
  CustomDocumentAppearance,
  CustomDocumentPermissions,
  LogoPosition,
  PageDisposition,
  PageEffect,
} from '../api/services/custom-document.service'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import { useOptionalEditorCustomization } from './draggable/EditorCustomizationContext'
import { backgroundEditorPresets } from './draggable/background/backgroundEditorAssets'
import { mergePageTurnSettings, type PageTurnSettings } from '../lib/pageTurnSettings'
import editorDynamicIframeHtml from '../../turnjs4/samples/editor-dynamic/index.html?raw'

function resolveStoredBackgroundImageUrl(
  raw: string | null | undefined,
): string | null {
  const s = raw?.trim() ?? ''
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  const fileName = s.split('/').pop()
  if (fileName) {
    const hit = backgroundEditorPresets.find((p) => p.id.endsWith(fileName))
    if (hit) return hit.src
  }
  return s
}

function isSafeBackgroundImageUrl(url: string): boolean {
  const u = url.trim()
  return (
    /^https:\/\//i.test(u) ||
    /^http:\/\//i.test(u) ||
    u.startsWith('/') ||
    u.startsWith('./') ||
    u.startsWith('../')
  )
}

function buildPreviewSurfaceStyle(
  color: string | null | undefined,
  image: string | null | undefined,
): CSSProperties | undefined {
  const c = color?.trim() ?? ''
  const rawImg = image?.trim() ?? ''
  const img = rawImg && isSafeBackgroundImageUrl(rawImg) ? rawImg : ''
  const style: CSSProperties = {}
  if (img) {
    style.backgroundImage = `url(${JSON.stringify(img)})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.backgroundRepeat = 'no-repeat'
  }
  if (c) style.backgroundColor = c
  if (!img && !c) return undefined
  return style
}

const DEFAULT_VIEWER_PERMISSIONS: CustomDocumentPermissions = {
  allowDownload: true,
  allowShare: true,
  allowPrint: true,
  allowFullscreen: true,
  allowPrevNext: true,
  allowZoom: true,
  allowFirstPage: true,
  allowLastPage: true,
  allowSearchText: false,
}

export type EditorPreviewProps = {
  pages: DocumentPage[]
  isPending: boolean
  isError: boolean
  error: unknown
  documentStatus?: string
  expectedPageCount?: number | null
  onRetry: () => void
  /** PDF pour téléchargement / impression (URL relative ou absolue) */
  pdfUrl?: string | null
  /** Nom suggéré pour le fichier téléchargé */
  downloadFileName?: string | null
  /** Vue publique : permissions serveur pour afficher / masquer les icônes */
  viewerPermissions?: CustomDocumentPermissions | null
  /** Vue publique (ou secours) : apparence serveur (fond, logo, etc.) */
  viewerAppearance?: CustomDocumentAppearance | null
}

function computeFlipDisplayMode(
  disposition: PageDisposition | undefined,
  containerWidth: number,
): 'single' | 'double' {
  const d = disposition ?? 'adaptive'
  if (d === 'always_single_page') return 'single'
  if (d === 'always_double_page') return 'double'
  return containerWidth < 768 ? 'single' : 'double'
}

const LOGO_POSITION_CLASSES: Record<LogoPosition, string> = {
  top_left: 'left-3 top-3 sm:left-4 sm:top-4',
  top_center: 'left-1/2 top-3 -translate-x-1/2 sm:top-4',
  top_right: 'right-3 top-3 sm:right-4 sm:top-4',
  center_left: 'left-3 top-1/2 -translate-y-1/2 sm:left-4',
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  center_right: 'right-3 top-1/2 -translate-y-1/2 sm:right-4',
  bottom_left: 'bottom-3 left-3 sm:bottom-4 sm:left-4',
  bottom_center: 'bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4',
  bottom_right: 'bottom-3 right-3 sm:bottom-4 sm:right-4',
}

/** Même géométrie que l’échantillon Basic (922 × 600) ; redimensionnement homothétique */
const BASIC_FLIP_W = 922
const BASIC_FLIP_H = 600
const SINGLE_PAGE_W = 461
const SINGLE_PAGE_H = 600

const MESSAGE_CHANNEL = 'ag-editor-flipbook'

const IFRAME_HTML = editorDynamicIframeHtml.replace(
  '<head>',
  '<head>\n    <base href="/turnjs4/samples/editor-dynamic/" />',
)

function absolutizeAssetUrl(url: string): string {
  const u = url.trim()
  if (/^https?:\/\//i.test(u)) return u
  const path = u.startsWith('/') ? u : `/${u}`
  return `${window.location.origin}${path}`
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: string }).message
    if (typeof msg === 'string' && msg.length > 0) return msg
  }
  return 'Impossible de charger les pages du document.'
}

export function EditorPreview({
  pages,
  isPending,
  isError,
  error,
  documentStatus,
  expectedPageCount,
  onRetry,
  pdfUrl: pdfUrlProp,
  downloadFileName,
  viewerPermissions,
  viewerAppearance,
}: EditorPreviewProps) {
  const editorCustomization = useOptionalEditorCustomization()
  const appearance = useMemo(() => {
    const raw =
      viewerAppearance ?? editorCustomization?.customization?.appearance
    if (!raw) return undefined
    const bg = resolveStoredBackgroundImageUrl(raw.backgroundImage)
    return {
      ...raw,
      backgroundImage: bg ?? raw.backgroundImage,
    }
  }, [viewerAppearance, editorCustomization?.customization?.appearance])

  const permissions =
    viewerPermissions ??
    editorCustomization?.customization?.permissions ??
    DEFAULT_VIEWER_PERMISSIONS

  const pdfUrl = pdfUrlProp?.trim() ? pdfUrlProp.trim() : null

  const iframeAppearance = useMemo(
    () => ({
      backgroundColor: appearance?.backgroundColor?.trim() || null,
      backgroundImage:
        appearance?.backgroundImage?.trim() &&
        isSafeBackgroundImageUrl(appearance.backgroundImage)
          ? appearance.backgroundImage.trim()
          : null,
    }),
    [appearance],
  )

  const previewSurfaceStyle = useMemo(
    () =>
      buildPreviewSurfaceStyle(
        appearance?.backgroundColor ?? null,
        appearance?.backgroundImage ?? null,
      ),
    [appearance?.backgroundColor, appearance?.backgroundImage],
  )

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.pageIndex - b.pageIndex),
    [pages],
  )

  const imageUrls = useMemo(() => sortedPages.map((p) => p.imageUrl), [sortedPages])

  const wrapRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false)
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false)
  const [frameReady, setFrameReady] = useState(false)
  const [rawSize, setRawSize] = useState({ w: BASIC_FLIP_W, h: BASIC_FLIP_H })
  const [containerWidth, setContainerWidth] = useState(BASIC_FLIP_W)

  const flipReady = !isPending && !isError && sortedPages.length > 0
  const appearanceRef = useRef(appearance)

  useEffect(() => {
    appearanceRef.current = appearance
  }, [appearance])

  useEffect(() => {
    if (!flipReady) return
    const el = wrapRef.current
    if (!el) return

    const measure = () => {
      const cr = el.getBoundingClientRect()
      const currentWidth = Math.floor(cr.width)
      const usableW = Math.max(220, currentWidth - 8)
      const usableH = Math.max(220, Math.floor(cr.height) - 8)
      const disp = appearanceRef.current?.pageDisposition ?? 'adaptive'
      const pageLayoutMode = computeFlipDisplayMode(disp, currentWidth)
      const baseW = pageLayoutMode === 'single' ? SINGLE_PAGE_W : BASIC_FLIP_W
      const baseH = pageLayoutMode === 'single' ? SINGLE_PAGE_H : BASIC_FLIP_H
      const scale = Math.min(usableW / baseW, usableH / baseH, 1)
      setContainerWidth(currentWidth)
      setRawSize({
        w: Math.max(pageLayoutMode === 'single' ? 200 : 440, Math.floor(baseW * scale)),
        h: Math.max(pageLayoutMode === 'single' ? 260 : 280, Math.floor(baseH * scale)),
      })
    }

    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    window.addEventListener('resize', measure)
    const vv = window.visualViewport
    vv?.addEventListener('resize', measure)
    vv?.addEventListener('scroll', measure)
    measure()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      vv?.removeEventListener('resize', measure)
      vv?.removeEventListener('scroll', measure)
    }
  }, [flipReady, appearance?.pageDisposition])

  const debouncedFlipSize = useDebouncedValue(rawSize, 48)

  const displayMode = computeFlipDisplayMode(
    appearance?.pageDisposition ?? 'adaptive',
    containerWidth,
  )

  const logoImg = appearance?.logoImage?.trim()
  const logoPos = appearance?.logoPosition ?? 'top_left'
  const logoOpacity = appearance?.logoOpacity ?? 1
  const logoMaxPx =
    typeof appearance?.logoSize === 'number' &&
    Number.isFinite(appearance.logoSize) &&
    appearance.logoSize > 0
      ? Math.min(320, Math.floor(appearance.logoSize))
      : 120
  const logoLink = appearance?.logoLinkUrl?.trim()

  const iframePageEffect: PageEffect = appearance?.pageEffect ?? 'notebook'

  const iframePageTurnSettings: PageTurnSettings = useMemo(
    () => mergePageTurnSettings(appearance?.pageTurnSettings),
    [appearance?.pageTurnSettings],
  )

  const pushPagesToIframe = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win || !imageUrls.length) return
    win.postMessage(
      {
        channel: MESSAGE_CHANNEL,
        type: 'pages',
        urls: imageUrls,
        flipWidth: debouncedFlipSize.w,
        flipHeight: debouncedFlipSize.h,
        displayMode,
        appearance: iframeAppearance,
        pageEffect: iframePageEffect,
        pageTurnSettings: iframePageTurnSettings,
        wheelNavigationEnabled: permissions.allowPrevNext,
      },
      window.location.origin,
    )
  }, [
    imageUrls,
    debouncedFlipSize.w,
    debouncedFlipSize.h,
    displayMode,
    iframeAppearance,
    iframePageEffect,
    iframePageTurnSettings,
    permissions.allowPrevNext,
  ])

  const pushAppearanceToIframe = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      {
        channel: MESSAGE_CHANNEL,
        type: 'appearance',
        backgroundColor: iframeAppearance.backgroundColor,
        backgroundImage: iframeAppearance.backgroundImage,
      },
      window.location.origin,
    )
  }, [iframeAppearance])

  const navigateFlipbook = useCallback((direction: 'previous' | 'next') => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      {
        channel: MESSAGE_CHANNEL,
        type: 'navigate',
        direction,
      },
      window.location.origin,
    )
  }, [])

  const goToFlipbookPage = useCallback((page: number) => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      { channel: MESSAGE_CHANNEL, type: 'goToPage', page },
      window.location.origin,
    )
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      void el.requestFullscreen().catch(() => {})
    } else {
      void document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const onFs = () => {
      setIsPreviewFullscreen(document.fullscreenElement === wrapRef.current)
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const openPrint = useCallback(() => {
    if (!pdfUrl) return
    window.open(absolutizeAssetUrl(pdfUrl), '_blank', 'noopener,noreferrer')
  }, [pdfUrl])

  const downloadHref = pdfUrl ? absolutizeAssetUrl(pdfUrl) : null
  const downloadName =
    downloadFileName?.replace(/[^\w.\- ()[\]]+/g, '_').trim() || 'document.pdf'

  useEffect(() => {
    if (!frameReady || !imageUrls.length) return
    pushPagesToIframe()
  }, [frameReady, pushPagesToIframe, imageUrls])

  useEffect(() => {
    if (!frameReady) return
    pushAppearanceToIframe()
  }, [frameReady, pushAppearanceToIframe])

  const showEmpty =
    !isPending &&
    !isError &&
    sortedPages.length === 0 &&
    (expectedPageCount === null || expectedPageCount === 0)

  const showProcessing =
    !isPending &&
    !isError &&
    sortedPages.length === 0 &&
    typeof expectedPageCount === 'number' &&
    expectedPageCount > 0

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      style={previewSurfaceStyle}
    >
      {isPending && (
        <div
          className="flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-3 px-4"
          role="status"
          aria-live="polite"
        >
          <ArrowPathIcon className="h-10 w-10 animate-spin text-gray-400" aria-hidden />
          <p className="text-sm text-gray-600">Chargement des pages…</p>
        </div>
      )}

      {isError && !isPending && (
        <div className="flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="max-w-md text-sm text-gray-700">{errorMessage(error)}</p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
            onClick={onRetry}
          >
            <ArrowPathIcon className="h-4 w-4" aria-hidden />
            Réessayer
          </button>
        </div>
      )}

      {showEmpty && (
        <div className="flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <PhotoIcon className="h-12 w-12 text-gray-300" aria-hidden />
          <p className="text-sm font-medium text-gray-700">Aucune page disponible</p>
          {documentStatus && (
            <p className="text-xs text-gray-500">
              Statut du document : <span className="capitalize">{documentStatus}</span>
            </p>
          )}
        </div>
      )}

      {showProcessing && (
        <div className="flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <ArrowPathIcon className="h-10 w-10 animate-spin text-gray-400" aria-hidden />
          <p className="text-sm text-gray-700">Conversion en cours…</p>
          <p className="text-xs text-gray-500">
            {expectedPageCount} page{expectedPageCount > 1 ? 's' : ''} attendue
            {expectedPageCount > 1 ? 's' : ''}. Le livre Turn.js apparaîtra ici après conversion.
          </p>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-[#ff3301] underline-offset-2 hover:underline"
            onClick={onRetry}
          >
            Actualiser
          </button>
        </div>
      )}

      {!isPending && !isError && sortedPages.length > 0 && (
        <div
          ref={wrapRef}
          className="relative flex min-h-0 flex-1 flex-col"
        >
          {logoImg ? (
            <div
              className={`pointer-events-none absolute z-20 ${LOGO_POSITION_CLASSES[logoPos]}`}
            >
              <div
                className="pointer-events-auto"
                style={{
                  opacity: Math.min(1, Math.max(0, logoOpacity)),
                  maxWidth: `min(${logoMaxPx * 2}px, 45vw)`,
                }}
              >
                {logoLink && /^https?:\/\//i.test(logoLink) ? (
                  <a
                    href={logoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block leading-none"
                  >
                    <img
                      src={logoImg}
                      alt=""
                      className="h-auto max-w-full object-contain"
                      style={{ maxHeight: logoMaxPx }}
                    />
                  </a>
                ) : (
                  <img
                    src={logoImg}
                    alt=""
                    className="h-auto max-w-full object-contain"
                    style={{ maxHeight: logoMaxPx }}
                  />
                )}
              </div>
            </div>
          ) : null}
          <div className="pointer-events-none absolute right-2 top-1/2 z-30 flex max-h-[min(85vh,calc(100%-2rem))] -translate-y-1/2 flex-col items-end sm:right-4">
            <div
              className="pointer-events-auto flex max-h-full flex-col items-center gap-1 overflow-y-auto rounded-xl bg-white/95 p-1.5 py-2 shadow-lg ring-1 ring-black/10 backdrop-blur-sm"
              role="toolbar"
              aria-label="Contrôles du flipbook"
            >
              {permissions.allowPrevNext && (
                <>
                  <button
                    type="button"
                    aria-label="Page précédente"
                    onClick={() => navigateFlipbook('previous')}
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]/40"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Page suivante"
                    onClick={() => navigateFlipbook('next')}
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]/40"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </>
              )}
              {permissions.allowZoom && (
                <button
                  type="button"
                  aria-expanded={thumbnailsOpen}
                  aria-label={thumbnailsOpen ? 'Masquer les vignettes' : 'Afficher les vignettes'}
                  onClick={() => setThumbnailsOpen((o) => !o)}
                  className={`rounded-lg p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]/40 ${
                    thumbnailsOpen
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
              )}
              {permissions.allowDownload && downloadHref && (
                <a
                  href={downloadHref}
                  download={downloadName.endsWith('.pdf') ? downloadName : `${downloadName}.pdf`}
                  className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]/40"
                  aria-label="Télécharger le PDF"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </a>
              )}
              {permissions.allowPrint && pdfUrl && (
                <button
                  type="button"
                  aria-label="Ouvrir le PDF pour impression"
                  onClick={openPrint}
                  className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]/40"
                >
                  <PrinterIcon className="h-5 w-5" />
                </button>
              )}
              {permissions.allowFullscreen && (
                <button
                  type="button"
                  aria-label={isPreviewFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                  onClick={toggleFullscreen}
                  className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]/40"
                >
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {thumbnailsOpen && permissions.allowZoom && (
            <div className="absolute bottom-0 left-0 right-0 z-30 max-h-[40vh] border-t border-gray-200 bg-white/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
                <span className="text-xs font-medium text-gray-700">Vignettes</span>
                <button
                  type="button"
                  className="text-xs font-medium text-[#ff3301] hover:underline"
                  onClick={() => setThumbnailsOpen(false)}
                >
                  Fermer
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto px-3 py-3">
                {sortedPages.map((p) => {
                  const src = p.thumbUrl ?? p.imageUrl
                  const pageNum = p.pageIndex
                  return (
                    <button
                      key={p.pageIndex}
                      type="button"
                      onClick={() => {
                        goToFlipbookPage(pageNum)
                        setThumbnailsOpen(false)
                      }}
                      className="h-20 w-14 shrink-0 overflow-hidden rounded-md border-2 border-transparent bg-gray-100 ring-gray-200 transition hover:border-[#ff3301] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]"
                      aria-label={`Aller à la page ${pageNum}`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            title="Flipbook Turn.js — pages document"
            srcDoc={IFRAME_HTML}
            onLoad={() => {
              setFrameReady(true)
              queueMicrotask(() => pushPagesToIframe())
            }}
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer-when-downgrade"
            className="z-0 h-full min-h-[min(48dvh,280px)] w-full flex-1 border-0 sm:min-h-[min(52dvh,320px)]"
          />
        </div>
      )}
    </div>
  )
}
