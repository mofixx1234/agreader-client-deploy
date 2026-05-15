import { Link } from 'react-router-dom'
import type { Flipbook } from '../types/flipbook'

function ThumbnailMock({ variant }: { variant: 1 | 2 | 3 }) {
  const bars =
    variant === 1
      ? ['w-4/5', 'w-full', 'w-3/5', 'w-full', 'w-2/3']
      : variant === 2
        ? ['w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-3/4']
        : ['w-3/4', 'w-full', 'w-full', 'w-2/3', 'w-11/12']

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-white to-gray-100">
      <div className="absolute inset-0 p-3 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-white" />
          <div className="h-2 flex-1 rounded bg-white" />
        </div>
        {bars.map((w, i) => (
          <div
            key={i}
            className={`mb-2 h-2 rounded bg-white ${w}`}
            style={{ opacity: 1 - i * 0.12 }}
          />
        ))}
        <div className="mt-3 grid grid-cols-3 gap-1">
          <div className="h-10 rounded bg-white/90" />
          <div className="h-10 rounded bg-white/90" />
          <div className="h-10 rounded bg-white/90" />
        </div>
      </div>
    </div>
  )
}

type FlipbookCardProps = {
  flipbook: Flipbook
}

export function FlipbookCard({ flipbook }: FlipbookCardProps) {
  return (
    <Link
      to={`/editor/${flipbook.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition hover:shadow-lg no-underline"
    >
      <p className="border-b border-gray-100 py-2 text-center text-xs text-gray-500">
        {flipbook.createdAtLabel}
      </p>
      <ThumbnailMock variant={flipbook.thumbVariant} />
      <p className="truncate px-3 py-2 text-center text-xs font-medium text-gray-800 group-hover:text-[#ff3301]">
        {flipbook.title}
      </p>
    </Link>
  )
}
