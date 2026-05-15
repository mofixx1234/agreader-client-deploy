import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import * as jqModule from 'jquery'
import 'turn.js'
import type { PageTextureMeta } from '../../lib/pdfPageCache'
import { springDamperStep } from '../../lib/springDamper'

/** jQuery en ESM (export =) : une seule fonction pour Turn et pour nous. */
const $ = (
  (jqModule as unknown as { default?: JQueryStatic }).default ??
  jqModule
) as unknown as JQueryStatic

/** Largeur visuelle du pli central (reliure douce, pas de barre noire). */
export const FLIPBOOK_GUTTER_PX = 14
const FORE_EDGE_PX = 10
export const FLIPBOOK_MAT_SIDE_GUTTER_PX = FORE_EDGE_PX * 2 + 8

/** Sensibilité drag : plus haut = plus de déplacement pour atteindre progress 1 (contrôle fin). */
const DRAG_FLIP_SENS = 0.92
const FLIP_DRAG_COMMIT = 0.4
const SWIPE_PROGRESS_PER_SEC = 0.95
const POINTER_V_CLAMP = 5.2
const SNAP_STIFFNESS = 155
const SNAP_DAMPING = 20

type DragFace = 'forward' | 'back' | null

function maxSpreadIndex(numPages: number): number {
  if (numPages <= 0) return 0
  return Math.max(0, Math.ceil(numPages / 2) - 1)
}

function numSpreads(numPages: number): number {
  if (numPages <= 0) return 0
  return Math.ceil(numPages / 2)
}

type FlipbookStageProps = {
  numPages: number
  spreadIndex: number
  onSpreadIndexChange: (next: number) => void
  getTexture: (pageIndex: number) => PageTextureMeta | undefined
  renderOverlay?: (ctx: {
    spreadIndex: number
    leftPage: number
    rightPage: number | null
    left: { cssWidth: number; cssHeight: number }
    right: { cssWidth: number; cssHeight: number } | null
  }) => React.ReactNode
  /** Libellé pendant que les textures ({@link getTexture}) ne sont pas encore prêtes */
  texturesPendingLabel?: string
}

/** Construit un double page (gauche | reliure | droite) pour une « page » Turn.js en mode single. */
function buildSpreadElement(
  spreadIdx: number,
  numPages: number,
  getTexture: (pageIndex: number) => PageTextureMeta | undefined,
  spreadWidth: number,
  spreadHeight: number,
  leftW: number,
  rightW: number,
): HTMLDivElement {
  const leftPage = spreadIdx * 2
  const rightPage = leftPage + 1 < numPages ? leftPage + 1 : null
  const leftMeta = getTexture(leftPage)
  const rightMeta = rightPage !== null ? getTexture(rightPage) : undefined

  const root = document.createElement('div')
  root.className = 'flex flex-row items-stretch bg-white'
  root.style.width = `${spreadWidth}px`
  root.style.height = `${spreadHeight}px`
  root.style.overflow = 'hidden'

  const leftCol = document.createElement('div')
  leftCol.className = 'shrink-0 overflow-hidden rounded-l-sm bg-white shadow-[inset_-8px_0_20px_rgba(0,0,0,0.05)]'
  leftCol.style.width = `${leftW}px`
  leftCol.style.height = `${spreadHeight}px`
  if (leftMeta) leftCol.appendChild(leftMeta.canvas)
  root.appendChild(leftCol)

  const gutter = document.createElement('div')
  gutter.className = 'shrink-0 self-stretch bg-white'
  gutter.style.width = `${FLIPBOOK_GUTTER_PX}px`
  gutter.style.minHeight = `${spreadHeight}px`
  gutter.style.background =
    'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(0,0,0,0.04) 18%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.04) 82%, rgba(255,255,255,0.5) 100%)'
  gutter.setAttribute('aria-hidden', 'true')
  root.appendChild(gutter)

  const rightCol = document.createElement('div')
  rightCol.className = 'shrink-0 overflow-hidden rounded-r-sm bg-white shadow-[inset_8px_0_20px_rgba(0,0,0,0.05)]'
  rightCol.style.width = `${rightW}px`
  rightCol.style.height = `${spreadHeight}px`
  if (rightMeta) {
    rightCol.appendChild(rightMeta.canvas)
  } else if (rightPage === null && leftMeta) {
    rightCol.className += ' flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-xs text-gray-400'
    rightCol.textContent = 'Fin du document'
  }
  root.appendChild(rightCol)

  return root
}

export function FlipbookStage({
  numPages,
  spreadIndex,
  onSpreadIndexChange,
  getTexture,
  renderOverlay,
  texturesPendingLabel = 'Rendu PDF…',
}: FlipbookStageProps) {
  const turnHostRef = useRef<HTMLDivElement | null>(null)
  const getTextureRef = useRef(getTexture)
  getTextureRef.current = getTexture

  const onSpreadIndexChangeRef = useRef(onSpreadIndexChange)
  onSpreadIndexChangeRef.current = onSpreadIndexChange

  const syncingFromTurnRef = useRef(false)
  const spreadIndexRef = useRef(spreadIndex)
  spreadIndexRef.current = spreadIndex

  const [dragFace, setDragFace] = useState<DragFace>(null)
  const [dragProgress, setDragProgress] = useState(0)
  const dragFaceRef = useRef<DragFace>(null)
  const dragProgressRef = useRef(0)
  const dragStartClientXRef = useRef(0)
  const dragBaseProgressRef = useRef(0)
  const lastMoveTsRef = useRef(0)
  const lastRawProgressRef = useRef(0)
  const pointerVelRef = useRef(0)
  const snapRafRef = useRef(0)
  const snapVelRef = useRef(0)
  /** Élément qui a appelé setPointerCapture (release sur le même nœud). */
  const pointerCaptureElRef = useRef<HTMLElement | null>(null)

  const maxSpread = useMemo(() => maxSpreadIndex(numPages), [numPages])
  const spreads = useMemo(() => numSpreads(numPages), [numPages])
  const leftPage = spreadIndex * 2
  const rightPage = leftPage + 1 < numPages ? leftPage + 1 : null

  const leftMeta = getTexture(leftPage)
  const rightMeta = rightPage !== null ? getTexture(rightPage) : undefined

  const spreadHeight = Math.max(
    leftMeta?.cssHeight ?? 0,
    rightMeta?.cssHeight ?? 0,
    rightPage === null ? leftMeta?.cssHeight ?? 0 : 0,
    360,
  )

  const halfApproxW = Math.max(leftMeta?.cssWidth ?? 0, rightMeta?.cssWidth ?? 280)
  const leftW = leftMeta?.cssWidth ?? halfApproxW
  const rightW = rightMeta?.cssWidth ?? leftMeta?.cssWidth ?? halfApproxW
  const spreadWidth = leftW + FLIPBOOK_GUTTER_PX + rightW

  const dimsKey = `${numPages}-${spreadWidth}-${spreadHeight}-${leftW}-${rightW}`

  const canPrev = spreadIndex > 0 && numPages > 0
  const canNext = spreadIndex < maxSpread && numPages > 0 && rightPage !== null

  const setTurnDisabled = useCallback((disabled: boolean) => {
    const el = turnHostRef.current
    if (!el) return
    const $el = $(el)
    if (typeof $el.turn === 'function' && $el.data('totalPages')) {
      try {
        $el.turn('disable', disabled)
      } catch {
        /* noop */
      }
    }
  }, [])

  const turnNext = useCallback(() => {
    const el = turnHostRef.current
    if (!el) return
    const $el = $(el)
    if (typeof $el.turn === 'function' && $el.data('totalPages')) {
      $el.turn('next')
    }
  }, [])

  const turnPrev = useCallback(() => {
    const el = turnHostRef.current
    if (!el) return
    const $el = $(el)
    if (typeof $el.turn === 'function' && $el.data('totalPages')) {
      $el.turn('previous')
    }
  }, [])

  const stopSnapRaf = useCallback(() => {
    if (snapRafRef.current) cancelAnimationFrame(snapRafRef.current)
    snapRafRef.current = 0
  }, [])

  const syncDragRefs = useCallback((face: DragFace, p: number) => {
    dragFaceRef.current = face
    dragProgressRef.current = p
    setDragFace(face)
    setDragProgress(p)
  }, [])

  const runSnapBack = useCallback(() => {
    stopSnapRaf()
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { x, v } = springDamperStep(
        dragProgressRef.current,
        snapVelRef.current,
        0,
        dt,
        SNAP_STIFFNESS,
        SNAP_DAMPING,
      )
      snapVelRef.current = v
      dragProgressRef.current = x
      setDragProgress(x)
      if (x > 0.012 || Math.abs(v) > 0.08) {
        snapRafRef.current = requestAnimationFrame(step)
      } else {
        dragProgressRef.current = 0
        snapVelRef.current = 0
        setDragProgress(0)
        setDragFace(null)
        dragFaceRef.current = null
        snapRafRef.current = 0
        setTurnDisabled(false)
      }
    }
    snapVelRef.current = 0
    snapRafRef.current = requestAnimationFrame(step)
  }, [setTurnDisabled, stopSnapRaf])

  const onPointerDownForward = useCallback(
    (e: React.PointerEvent) => {
      if (!canNext || dragFaceRef.current !== null) return
      e.preventDefault()
      e.stopPropagation()
      stopSnapRaf()
      const cap = e.currentTarget as HTMLElement
      pointerCaptureElRef.current = cap
      cap.setPointerCapture(e.pointerId)
      setTurnDisabled(true)
      dragStartClientXRef.current = e.clientX
      dragBaseProgressRef.current = 0
      lastMoveTsRef.current = 0
      lastRawProgressRef.current = 0
      pointerVelRef.current = 0
      syncDragRefs('forward', 0)
    },
    [canNext, setTurnDisabled, stopSnapRaf, syncDragRefs],
  )

  const onPointerDownBack = useCallback(
    (e: React.PointerEvent) => {
      if (!canPrev || dragFaceRef.current !== null) return
      e.preventDefault()
      e.stopPropagation()
      stopSnapRaf()
      const cap = e.currentTarget as HTMLElement
      pointerCaptureElRef.current = cap
      cap.setPointerCapture(e.pointerId)
      setTurnDisabled(true)
      dragStartClientXRef.current = e.clientX
      dragBaseProgressRef.current = 0
      lastMoveTsRef.current = 0
      lastRawProgressRef.current = 0
      pointerVelRef.current = 0
      syncDragRefs('back', 0)
    },
    [canPrev, setTurnDisabled, stopSnapRaf, syncDragRefs],
  )

  useEffect(() => {
    if (dragFace === null) return

    const w = Math.max(160, spreadWidth * DRAG_FLIP_SENS)

    const onMove = (ev: PointerEvent) => {
      if (dragFaceRef.current === null) return
      let raw: number
      if (dragFaceRef.current === 'forward') {
        raw = Math.min(
          1,
          Math.max(0, dragBaseProgressRef.current + (dragStartClientXRef.current - ev.clientX) / w),
        )
      } else {
        raw = Math.min(
          1,
          Math.max(0, dragBaseProgressRef.current + (ev.clientX - dragStartClientXRef.current) / w),
        )
      }

      const now = ev.timeStamp > 0 ? ev.timeStamp : performance.now()
      const dtMove = (now - lastMoveTsRef.current) / 1000
      if (lastMoveTsRef.current > 0 && dtMove > 0.001 && dtMove < 0.1) {
        const inst = (raw - lastRawProgressRef.current) / dtMove
        const blend = 0.5
        pointerVelRef.current = Math.max(
          -POINTER_V_CLAMP,
          Math.min(POINTER_V_CLAMP, pointerVelRef.current * (1 - blend) + inst * blend),
        )
      }
      lastMoveTsRef.current = now
      lastRawProgressRef.current = raw
      dragProgressRef.current = raw
      setDragProgress(raw)
    }

    const finish = (ev: PointerEvent) => {
      if (dragFaceRef.current === null) return
      const face = dragFaceRef.current
      const p = dragProgressRef.current
      const pv = pointerVelRef.current
      const capEl = pointerCaptureElRef.current
      pointerCaptureElRef.current = null
      try {
        capEl?.releasePointerCapture(ev.pointerId)
      } catch {
        /* noop */
      }

      let complete = false
      if (pv > SWIPE_PROGRESS_PER_SEC) complete = true
      else if (pv < -SWIPE_PROGRESS_PER_SEC) complete = false
      else complete = p >= FLIP_DRAG_COMMIT

      dragFaceRef.current = null
      setDragFace(null)
      pointerVelRef.current = 0
      lastMoveTsRef.current = 0

      if (complete) {
        dragProgressRef.current = 0
        setDragProgress(0)
        setTurnDisabled(false)
        if (face === 'forward') turnNext()
        else turnPrev()
      } else {
        dragProgressRef.current = p
        setDragProgress(p)
        snapVelRef.current = 0
        runSnapBack()
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
    }
  }, [dragFace, runSnapBack, setTurnDisabled, spreadWidth, turnNext, turnPrev])

  useEffect(() => {
    return () => {
      stopSnapRaf()
    }
  }, [stopSnapRaf])

  useEffect(() => {
    const el = turnHostRef.current
    if (!el || numPages <= 0 || spreads <= 0) return

    el.innerHTML = ''
    const gt = getTextureRef.current
    for (let s = 0; s < spreads; s++) {
      el.appendChild(buildSpreadElement(s, numPages, gt, spreadWidth, spreadHeight, leftW, rightW))
    }

    const $el = $(el)
    const onTurned = (_e: unknown, page: number) => {
      if (typeof page !== 'number') return
      syncingFromTurnRef.current = true
      const next = Math.max(0, Math.min(spreads - 1, page - 1))
      onSpreadIndexChangeRef.current(next)
    }

    $el.turn({
      display: 'single',
      width: spreadWidth,
      height: spreadHeight,
      elevation: 52,
      gradients: true,
      acceleration: true,
      duration: 820,
      page: spreadIndexRef.current + 1,
      when: {
        turned: onTurned,
      },
    })

    return () => {
      try {
        $el.turn('stop')
      } catch {
        /* noop */
      }
      try {
        if (typeof $el.turn === 'function' && $el.data('totalPages')) {
          $el.turn('destroy')
        }
      } catch {
        /* noop */
      }
      $el.off()
      el.innerHTML = ''
    }
  }, [dimsKey, numPages, spreads, spreadWidth, spreadHeight, leftW, rightW])

  useEffect(() => {
    const el = turnHostRef.current
    if (!el || numPages <= 0) return
    const $el = $(el)
    if (typeof $el.turn !== 'function' || !$el.data('totalPages')) return
    if (syncingFromTurnRef.current) {
      syncingFromTurnRef.current = false
      return
    }
    const target = spreadIndex + 1
    try {
      const cur = $el.turn('page') as number
      if (cur !== target) {
        $el.turn('page', target)
      }
    } catch {
      /* noop */
    }
  }, [spreadIndex, numPages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        turnNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        turnPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turnNext, turnPrev])

  const overlayNode =
    leftMeta &&
    renderOverlay?.({
      spreadIndex,
      leftPage,
      rightPage,
      left: { cssWidth: leftMeta.cssWidth, cssHeight: leftMeta.cssHeight },
      right:
        rightMeta !== undefined
          ? { cssWidth: rightMeta.cssWidth, cssHeight: rightMeta.cssHeight }
          : null,
    })

  const hasAnyTexture = Boolean(leftMeta || rightMeta)

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative mx-auto [transform-style:preserve-3d]"
        style={{
          perspective: '2800px',
          perspectiveOrigin: '50% 40%',
        }}
      >
        {!hasAnyTexture ? (
          <div
            className="flex min-h-[420px] min-w-[280px] animate-pulse items-center justify-center rounded-sm bg-gray-200 text-sm text-gray-500"
            style={{ width: 'min(100%, 820px)' }}
          >
            {texturesPendingLabel}
          </div>
        ) : (
          <div className="relative">
            <div
              className="relative flex flex-row items-start rounded-[11px] bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.2)]"
              style={{ minHeight: spreadHeight + 24 }}
            >
              <div
                aria-hidden
                className="pointer-events-none mr-1 shrink-0 self-stretch rounded-l-[4px] border border-[#ff3301]/20 bg-white"
                style={{
                  width: FORE_EDGE_PX,
                  minHeight: spreadHeight,
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    rgba(0,0,0,0.07) 0px,
                    rgba(0,0,0,0.07) 1px,
                    rgba(255,255,255,0.35) 1px,
                    rgba(255,255,255,0.35) 3px
                  )`,
                  boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.06)',
                }}
              />

              <div
                className="relative shrink-0"
                style={{ width: spreadWidth, minHeight: spreadHeight }}
              >
                <div
                  className="relative overflow-visible rounded-sm bg-white will-change-transform"
                  style={{
                    width: spreadWidth,
                    minHeight: spreadHeight,
                    transformStyle: 'preserve-3d',
                    transform:
                      dragFace !== null && dragProgress > 0
                        ? `rotateY(${(dragFace === 'forward' ? -1 : 1) * dragProgress * 12}deg)`
                        : undefined,
                    transformOrigin: `${leftW + FLIPBOOK_GUTTER_PX / 2}px 50%`,
                    transition: dragFace !== null ? undefined : 'transform 0.22s ease-out',
                  }}
                >
                  <div ref={turnHostRef} className="turn-host h-full w-full overflow-visible" />
                </div>
                <div className="absolute inset-0 z-[22] flex flex-row items-stretch">
                  <button
                    type="button"
                    aria-label="Glisser pour la page précédente"
                    disabled={!canPrev}
                    onPointerDown={onPointerDownBack}
                    className={`touch-none shrink-0 cursor-grab border-0 bg-transparent p-0 active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/60 ${
                      !canPrev ? 'pointer-events-none opacity-30' : ''
                    }`}
                    style={{ width: leftW }}
                  />
                  <span className="pointer-events-none shrink-0" style={{ width: FLIPBOOK_GUTTER_PX }} />
                  <button
                    type="button"
                    aria-label="Glisser pour la page suivante"
                    disabled={!canNext}
                    onPointerDown={onPointerDownForward}
                    className={`touch-none shrink-0 cursor-grab border-0 bg-transparent p-0 active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/60 ${
                      !canNext ? 'pointer-events-none opacity-30' : ''
                    }`}
                    style={{ width: rightW }}
                  />
                </div>
              </div>

              <div
                aria-hidden
                className="pointer-events-none ml-1 shrink-0 self-stretch rounded-r-[4px] border border-[#ff3301]/20 bg-white"
                style={{
                  width: FORE_EDGE_PX,
                  minHeight: spreadHeight,
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    rgba(255,255,255,0.35) 0px,
                    rgba(255,255,255,0.35) 2px,
                    rgba(0,0,0,0.07) 2px,
                    rgba(0,0,0,0.07) 3px
                  )`,
                  boxShadow: 'inset 3px 0 6px rgba(0,0,0,0.06)',
                }}
              />
            </div>

            {overlayNode ? (
              <div className="pointer-events-none absolute inset-3 z-[35] flex flex-row items-start">
                {overlayNode}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!canPrev}
          onClick={turnPrev}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden />
          Précédent
        </button>
        <span className="text-center text-sm text-gray-600">
          Double page {spreadIndex + 1} / {maxSpread + 1}
          {numPages ? (
            <span className="block text-xs text-gray-500">
              Pages {leftPage + 1}
              {rightPage !== null ? ` · ${rightPage + 1}` : ''} — Turn.js · glisser sur gauche/droite
            </span>
          ) : null}
        </span>
        <button
          type="button"
          disabled={!canNext}
          onClick={turnNext}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
          <ChevronRightIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}
