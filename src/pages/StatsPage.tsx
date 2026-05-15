import {
  ArrowTrendingUpIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

const cards = [
  { label: 'Pages vues', value: '12,4k', icon: EyeIcon, delta: '+8 %' },
  { label: 'Visiteurs uniques', value: '3 021', icon: UsersIcon, delta: '+3 %' },
  { label: 'Clics hotspots', value: '892', icon: CursorArrowRaysIcon, delta: '+12 %' },
  { label: 'Taux d’engagement', value: '24 %', icon: ArrowTrendingUpIcon, delta: '+1 pt' },
]

export function StatsPage() {
  return (
    <main className="mx-auto max-w-[1600px] flex-1 px-3 py-8 sm:px-5">
      <h1 className="text-xl font-bold text-gray-900">Statistiques</h1>
      <p className="mt-1 text-sm text-gray-500">Données de démonstration — branchement analytics à venir.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-[#ff3301]/35 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <c.icon className="h-8 w-8 text-[#ff3301]" />
              <span className="rounded-full bg-[#ff3301]/10 px-2 py-0.5 text-xs font-medium text-[#ff3301]">
                {c.delta}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 h-64 rounded-lg border border-dashed border-[#ff3301]/35 bg-white p-6 text-center text-sm text-gray-400">
        Graphique des visites (composant chart à intégrer)
      </div>
    </main>
  )
}
