import type { EditorHotspot } from '../../types/hotspot'

type EditorOverlayProps = {
  hotspots: EditorHotspot[]
  pageIndex: number
  /** Même taille que la texture affichée (px CSS) */
  cssWidth: number
  cssHeight: number
  editMode: boolean
  onHotspotClick?: (id: string) => void
}

export function EditorOverlay({
  hotspots,
  pageIndex,
  cssWidth,
  cssHeight,
  editMode,
  onHotspotClick,
}: EditorOverlayProps) {
  const list = hotspots.filter((h) => h.pageIndex === pageIndex)

  return (
    <div
      className="pointer-events-none relative"
      style={{ width: cssWidth, height: cssHeight }}
      data-editor-overlay
    >
      {list.map((h) => (
        <button
          key={h.id}
          type="button"
          title={h.label ?? 'Zone interactive'}
          className={`pointer-events-auto ${
            editMode
              ? 'absolute cursor-pointer rounded border-2 border-dashed border-[#ff3301] bg-[#ff3301]/10 hover:bg-[#ff3301]/20'
              : 'absolute cursor-pointer rounded border border-transparent bg-transparent hover:bg-black/5'
          }`}
          style={{
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            width: `${h.w * 100}%`,
            height: `${h.h * 100}%`,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onHotspotClick?.(h.id)
          }}
        >
          {editMode && h.label ? (
            <span className="pointer-events-none absolute left-0 top-full mt-0.5 whitespace-nowrap rounded bg-gray-900/85 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {h.label}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
