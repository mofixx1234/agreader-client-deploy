import { ArrowUpTrayIcon } from '@heroicons/react/24/solid'
import { DocumentCheckIcon } from '@heroicons/react/24/outline'
import {
  AdjustmentsHorizontalIcon,
  Bars3BottomLeftIcon,
  BookmarkIcon,
  BookOpenIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
  PhotoIcon,
  StarIcon,
} from '@heroicons/react/24/solid'

const items = [
  { id: 'title', label: 'Title', Icon: Bars3BottomLeftIcon },
  { id: 'page-effect', label: 'Page Effect', Icon: BookOpenIcon },
  { id: 'background', label: 'Background', Icon: PhotoIcon },
  { id: 'logo', label: 'Logo', Icon: StarIcon },
  { id: 'controls', label: 'Controls', Icon: AdjustmentsHorizontalIcon },
  { id: 'toc', label: 'Table of contents', Icon: BookmarkIcon },
  // { id: 'bg-audio', label: 'Background Audio', Icon: SpeakerWaveIcon },
  { id: 'password-protect', label: 'Password protect', Icon: LockClosedIcon },
  // { id: 'capture-lead', label: 'Capture lead form', Icon: IdentificationIcon },
  // { id: 'replace-pdf', label: 'Replace PDF', Icon: ArrowPathIcon },
  { id: 'copy-flipbook', label: 'Copy flipbook', Icon: DocumentDuplicateIcon },
] as const

export type EditorToolId = (typeof items)[number]['id']

type EditorSidebarProps = {
  className?: string
  onShareClick?: () => void
  /** Ex. fermer le drawer mobile après sélection d’un outil */
  onItemClick?: (id: EditorToolId) => void
  /** Panneau emboîté (drawer) : flex + scroll interne au lieu de shrink-0 fixe */
  embedded?: boolean
}

export function EditorSidebar({ className = '', onShareClick, onItemClick, embedded }: EditorSidebarProps) {
  const layoutClass = embedded
    ? 'flex min-h-0 min-w-0 flex-1 flex-col'
    : 'flex w-full shrink-0 flex-col lg:w-[260px]'

  return (
    <aside className={`${layoutClass} border-r border-gray-200 bg-white ${className}`.trim()}>
      <div className="flex gap-2 border-b border-gray-200 p-3">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#ff3301] py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          onClick={onShareClick}
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
          Partager
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white py-2 text-xs font-semibold text-gray-950 shadow-sm transition-colors hover:border-gray-950 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
        >
          <DocumentCheckIcon className="h-4 w-4" />
          Enregistrer
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className="group flex w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-gray-900 shadow-sm transition-colors hover:border-gray-950 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
            onClick={() => onItemClick?.(id)}
          >
            <Icon className="h-5 w-5 shrink-0 text-gray-500 transition-colors group-hover:text-gray-950" aria-hidden />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
