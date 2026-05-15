import { Link } from 'react-router-dom'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] px-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-4xl font-bold text-white">Page non trouvée</h2>

        {/* Description */}
        <p className="mb-8 max-w-md text-lg text-white/70">
          Désolé, la page que vous recherchez n'existe pas ou a été supprimée.
        </p>

        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-white/10 p-4">
            <div className="text-white/50">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Retour
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#148a5f] to-[#19a975] px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-[#148a5f]/50"
          >
            <HomeIcon className="h-5 w-5" />
            Accueil
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-white/40">
          Besoin d'aide ?{' '}
          <Link to="/support" className="text-white/70 hover:text-white transition-colors underline">
            Contactez le support
          </Link>
        </p>
      </div>
    </div>
  )
}
