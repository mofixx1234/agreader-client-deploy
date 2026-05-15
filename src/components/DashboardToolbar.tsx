import {
  CalendarDaysIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useUploadModal } from '../contexts/UploadModalContext'

const DEFAULT_FREE_FLIPBOOK_LIMIT = 5

export type DashboardDateSort = 'desc' | 'asc'

type DashboardToolbarProps = {
  gridView: boolean
  onToggleGrid: (grid: boolean) => void
  selectedCount: number
  onDeleteSelected?: () => void
  isDeleting?: boolean
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  selectedDate: string
  onSelectedDateChange: (date: string) => void
  dateSort: DashboardDateSort
  onDateSortChange: (sort: DashboardDateSort) => void
  /** Nombre de flipbooks actuellement dans le compte (liste chargee). */
  flipbooksUsed: number
  /** Nombre de flipbooks visibles apres recherche / filtre calendrier. */
  visibleFlipbooks: number
  /** Plafond du forfait gratuit ; a remplacer par les donnees abonnement quand elles existeront. */
  flipbooksLimit?: number
}

export function DashboardToolbar({
  gridView,
  onToggleGrid,
  selectedCount,
  onDeleteSelected,
  isDeleting,
  searchQuery,
  onSearchQueryChange,
  selectedDate,
  onSelectedDateChange,
  dateSort,
  onDateSortChange,
  flipbooksUsed,
  visibleFlipbooks,
  flipbooksLimit = DEFAULT_FREE_FLIPBOOK_LIMIT,
}: DashboardToolbarProps) {
  const { open: openUpload } = useUploadModal()

  const iconBtn =
    'flex h-9 w-9 items-center justify-center rounded border bg-white text-gray-600 shadow-sm transition hover:bg-[#e62d00]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]/30'
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedDate.length > 0
  const nextDateSort = dateSort === 'desc' ? 'asc' : 'desc'

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-3 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className={`${iconBtn} disabled:pointer-events-none disabled:opacity-40`}
            aria-label="Supprimer la selection"
            disabled={selectedCount === 0 || isDeleting}
            onClick={() => onDeleteSelected?.()}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleGrid(true)}
            className={`${iconBtn} ${gridView ? 'border-[#ff3301]/40 bg-[#ff3301]/5 text-[#ff3301]' : ''}`}
            aria-label="Vue grille"
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleGrid(false)}
            className={`${iconBtn} ${!gridView ? 'border-[#ff3301]/40 bg-[#ff3301]/5 text-[#ff3301]' : ''}`}
            aria-label="Vue liste"
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`${iconBtn} ${dateSort === 'asc' ? 'border-[#ff3301]/40 bg-[#ff3301]/5 text-[#ff3301]' : ''}`}
            aria-label={dateSort === 'desc' ? 'Trier par date ancienne' : 'Trier par date recente'}
            title={dateSort === 'desc' ? "Plus recents d'abord" : "Plus anciens d'abord"}
            onClick={() => onDateSortChange(nextDateSort)}
          >
            <CalendarDaysIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-w-[16rem] flex-1 flex-wrap items-center gap-2 sm:justify-center">
          <label className="relative h-9 min-w-[13rem] flex-1 sm:max-w-[22rem]">
            <span className="sr-only">Rechercher un flipbook</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Rechercher"
              className="h-full w-full rounded border border-gray-300 bg-white pl-9 pr-8 text-sm text-gray-800 shadow-sm outline-none transition focus:border-[#ff3301] focus:ring-2 focus:ring-[#ff3301]/15"
            />
            {searchQuery ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                aria-label="Effacer la recherche"
                onClick={() => onSearchQueryChange('')}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            ) : null}
          </label>

          <label className="relative h-9">
            <span className="sr-only">Filtrer par date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => onSelectedDateChange(event.target.value)}
              className="h-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-[#ff3301] focus:ring-2 focus:ring-[#ff3301]/15"
            />
          </label>

          {hasActiveFilters ? (
            <button
              type="button"
              className="h-9 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-950"
              onClick={() => {
                onSearchQueryChange('')
                onSelectedDateChange('')
              }}
            >
              Reinitialiser
            </button>
          ) : null}

          <button
            type="button"
            onClick={openUpload}
            className="h-9 rounded border-2 border-[#ff3301] bg-white px-4 text-sm font-semibold text-[#ff3301] shadow-sm transition hover:bg-[#e62d00]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3301]/30"
          >
            Nouveau flipbook
          </button>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{visibleFlipbooks}</span>
            {visibleFlipbooks !== flipbooksUsed ? (
              <> / <span className="font-medium text-gray-900">{flipbooksUsed}</span></>
            ) : null}{' '}
            fichiers
            {flipbooksLimit > 0 ? (
              <span className="text-gray-400"> · limite {flipbooksLimit}</span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  )
}
