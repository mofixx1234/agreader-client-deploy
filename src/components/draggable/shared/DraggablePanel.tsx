import { type ReactNode, useRef } from 'react'
import Draggable from 'react-draggable'
import { XMarkIcon } from '@heroicons/react/24/solid'

type DraggablePanelProps = {
  title: string
  children: ReactNode
  footer?: ReactNode
  widthClass?: string
  defaultPosition?: { x: number; y: number }
  onClose: () => void
}

export function DraggablePanel({
  title,
  children,
  footer,
  widthClass = 'w-[720px]',
  defaultPosition = { x: 420, y: 90 },
  onClose,
}: DraggablePanelProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-panel-handle" defaultPosition={defaultPosition}>
      <section
        ref={nodeRef}
        className={`fixed left-0 top-0 z-[60] max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg bg-white text-gray-950 shadow-2xl ring-1 ring-black/10 ${widthClass}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`drag-panel-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <header className="drag-panel-handle flex cursor-move select-none items-center justify-between bg-gray-50 px-5 py-4">
          <h2 id={`drag-panel-${title.toLowerCase().replace(/\s+/g, '-')}`} className="text-lg font-medium">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
            aria-label="Fermer"
            onClick={onClose}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="bg-white">{children}</div>
        <footer className="flex justify-center gap-5 bg-gray-50 px-6 py-5">
          {footer ?? (
            <button
              type="button"
              className="min-h-10 min-w-[140px] rounded-md border border-gray-950 bg-white px-6 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-950 hover:text-white"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </footer>
      </section>
    </Draggable>
  )
}
