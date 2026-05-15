import { BackgroundDraggable } from './background/BackgroundDraggable'
import { ControlsDraggable } from './controls/ControlsDraggable'
import { LogoDraggable } from './logo/LogoDraggable'
import { PageEffectDraggable } from './page-effect/PageEffectDraggable'
import { PasswordProtectDraggable } from './password-protect/PasswordProtectDraggable'
import { TableOfContentsDraggable } from './toc/TableOfContentsDraggable'
import { TitleDraggable } from './title/TitleDraggable'
import type { EditorToolId } from '../EditorSidebar'

type EditorDraggablePanelsProps = {
  activeTool: EditorToolId | null
  onClose: () => void
}

export const draggableToolIds = [
  'title',
  'page-effect',
  'background',
  'logo',
  'controls',
  'toc',
  'password-protect',
] as const satisfies ReadonlyArray<EditorToolId>

export type DraggableToolId = (typeof draggableToolIds)[number]

export function isDraggableTool(id: EditorToolId): id is DraggableToolId {
  return draggableToolIds.includes(id as DraggableToolId)
}

export function EditorDraggablePanels({ activeTool, onClose }: EditorDraggablePanelsProps) {
  if (!activeTool) return null

  switch (activeTool) {
    case 'title':
      return <TitleDraggable onClose={onClose} />
    case 'page-effect':
      return <PageEffectDraggable onClose={onClose} />
    case 'background':
      return <BackgroundDraggable onClose={onClose} />
    case 'logo':
      return <LogoDraggable onClose={onClose} />
    case 'controls':
      return <ControlsDraggable onClose={onClose} />
    case 'toc':
      return <TableOfContentsDraggable onClose={onClose} />
    case 'password-protect':
      return <PasswordProtectDraggable onClose={onClose} />
    default:
      return null
  }
}
