import { useEffect, useState } from 'react'
import agReaderLogo from '../assets/agg.png'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChartBarIcon,
  DocumentPlusIcon,
  HomeIcon,
  PencilSquareIcon,
    QuestionMarkCircleIcon,
    Squares2X2Icon,
    UserIcon,
    UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useAuthModal } from '../contexts/AuthModalContext'
import { useUploadModal } from '../contexts/UploadModalContext'

export type NavActive =
  | 'home'
  | 'dashboard'
  | 'stats'
  | 'account'
  | 'edit'
  | 'support'

type AppNavbarProps = {
  variant?: 'app' | 'editor'
  tone?: 'brand' | 'editor'
  /** Si non fourni, déduit de l’URL */
  active?: NavActive
}

const navItemClass = (active: boolean, tone: 'brand' | 'editor') => {
  const activeClass = tone === 'editor' ? 'bg-white/10 text-white' : 'bg-white/15'
  const inactiveClass = 'hover:bg-white/10'

  return [
    'flex h-full min-h-[63px] w-[118px] flex-col items-center justify-center gap-1 px-2 text-white transition-colors',
    active ? activeClass : inactiveClass,
  ].join(' ')
}

const drawerRowClass = (active: boolean) =>
  [
    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-medium transition-colors no-underline',
    active ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10',
  ].join(' ')

function inferActive(pathname: string): NavActive {
  if (pathname.startsWith('/editor')) return 'edit'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/stats')) return 'stats'
  if (pathname.startsWith('/account')) return 'account'
  if (pathname.startsWith('/support')) return 'support'
  return 'home'
}

export function AppNavbar({
  variant = 'app',
  tone = 'brand',
  active: activeProp,
}: AppNavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { openLogin, openRegister } = useAuthModal()
  const { open: openUpload } = useUploadModal()
  const active = activeProp ?? inferActive(location.pathname)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Vous êtes déconnecté.')
    setMobileOpen(false)
    navigate('/')
  }

  const headerBg = 'bg-[#0d0d0d]'
  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const openUploadFromDrawer = () => {
    closeMobile()
    openUpload()
  }

  return (
    <header className={`sticky top-0 z-40 w-full shadow-sm ${headerBg}`}>
      <div className="mx-auto flex h-[63px] max-w-none items-stretch justify-between px-0">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 md:w-[350px] md:flex-none md:px-10">
          <button
            type="button"
            className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="app-navbar-drawer"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-5 w-5" aria-hidden />
            ) : (
              <Bars3Icon className="h-5 w-5" aria-hidden />
            )}
          </button>
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 text-white no-underline"
            onClick={closeMobile}
          >
            <span className="relative inline-flex items-end leading-none">
              {/* <span className="mr-1 flex flex-col">
                <span className="text-[13px] font-extrabold tracking-tight text-white">AG</span>
                <span className="text-[18px] font-extrabold tracking-tight text-white">Read</span>
              </span>
              <span className="relative inline-block text-[18px] font-extrabold tracking-tight text-white">
                <span className="absolute -inset-1 rounded-full bg-[#ff3301]" aria-hidden />
                <span className="relative z-10 px-1.5">er</span>
              </span> */}

              <img src={agReaderLogo} alt="AG Reader" className="h-[100px] w-[100px]" />
            </span>
          </Link>
        </div>

        <nav
          className="hidden h-full items-stretch justify-end gap-0 md:flex"
          aria-label="Navigation principale"
        >
          <Link to="/" className={`no-underline ${navItemClass(active === 'home', tone)}`}>
            <HomeIcon className="h-4 w-4 shrink-0" />
            <span className="text-[11px] font-medium leading-none">Accueil</span>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`no-underline ${navItemClass(active === 'dashboard', tone)}`}>
                <Squares2X2Icon className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-medium leading-none">bord</span>
              </Link>
              <Link to="/stats" className={`no-underline ${navItemClass(active === 'stats', tone)}`}>
                <ChartBarIcon className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-medium leading-none">Statistiques</span>
              </Link>
              {variant === 'editor' && (
                <Link to="/editor/demo" className={`no-underline ${navItemClass(active === 'edit', tone)}`}>
                  <PencilSquareIcon className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-medium leading-none">Éditer</span>
                </Link>
              )}
              <Link to="/account" className={`no-underline ${navItemClass(active === 'account', tone)}`}>
                <UserIcon className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-medium leading-none">Compte</span>
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openLogin()}
                className={`${navItemClass(false, tone)} cursor-pointer border-0 bg-transparent font-[inherit]`}
              >
                <ArrowLeftOnRectangleIcon className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-medium leading-none">Connexion</span>
              </button>
              <button
                type="button"
                onClick={() => openRegister()}
                className={`${navItemClass(false, tone)} cursor-pointer border-0 bg-transparent font-[inherit]`}
              >
                <UserPlusIcon className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-medium leading-none">Inscription</span>
              </button>
            </>
          )}
          <Link to="/support" className={`no-underline ${navItemClass(active === 'support', tone)}`}>
            <QuestionMarkCircleIcon className="h-4 w-4 shrink-0" />
            <span className="text-[11px] font-medium leading-none">Aide</span>
          </Link>
          {user && (
            <button type="button" onClick={handleLogout} className={navItemClass(false, tone)}>
              <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-medium leading-none">Déconnexion</span>
            </button>
          )}
        </nav>
      </div>

      {/* Drawer mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Fermer le menu"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={closeMobile}
        />
        <aside
          id="app-navbar-drawer"
          inert={!mobileOpen}
          className={`absolute top-0 bottom-0 left-0 flex w-[min(20rem,88vw)] flex-col shadow-2xl transition-transform duration-300 ease-out ${headerBg} ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/15 px-4 py-3">
            <span className="text-base font-semibold text-white">Menu</span>
            <button
              type="button"
              className="rounded-lg p-2 text-white hover:bg-white/10"
              aria-label="Fermer"
              onClick={closeMobile}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pb-6" aria-label="Navigation">
            <Link to="/" className={drawerRowClass(active === 'home')} onClick={closeMobile}>
              <HomeIcon className="h-5 w-5 shrink-0 opacity-90" />
              Accueil
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={drawerRowClass(active === 'dashboard')}
                  onClick={closeMobile}
                >
                  <Squares2X2Icon className="h-5 w-5 shrink-0 opacity-90" />
                  bord
                </Link>
                <Link to="/stats" className={drawerRowClass(active === 'stats')} onClick={closeMobile}>
                  <ChartBarIcon className="h-5 w-5 shrink-0 opacity-90" />
                  Statistiques
                </Link>
                <button
                  type="button"
                  className={`${drawerRowClass(false)} border-0 bg-transparent cursor-pointer font-[inherit]`}
                  onClick={openUploadFromDrawer}
                >
                  <DocumentPlusIcon className="h-5 w-5 shrink-0 opacity-90" />
                  Nouveau flipbook
                </button>
                {variant === 'editor' && (
                  <Link
                    to="/editor/demo"
                    className={drawerRowClass(active === 'edit')}
                    onClick={closeMobile}
                  >
                    <PencilSquareIcon className="h-5 w-5 shrink-0 opacity-90" />
                    Éditer
                  </Link>
                )}
                <Link
                  to="/account"
                  className={drawerRowClass(active === 'account')}
                  onClick={closeMobile}
                >
                  <UserIcon className="h-5 w-5 shrink-0 opacity-90" />
                  Compte
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`${drawerRowClass(false)} border-0 bg-transparent cursor-pointer font-[inherit]`}
                  onClick={() => {
                    closeMobile()
                    openLogin()
                  }}
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0 opacity-90" />
                  Connexion
                </button>
                <button
                  type="button"
                  className={`${drawerRowClass(false)} border-0 bg-transparent cursor-pointer font-[inherit]`}
                  onClick={() => {
                    closeMobile()
                    openRegister()
                  }}
                >
                  <UserPlusIcon className="h-5 w-5 shrink-0 opacity-90" />
                  Inscription
                </button>
              </>
            )}
            <Link to="/support" className={drawerRowClass(active === 'support')} onClick={closeMobile}>
              <QuestionMarkCircleIcon className="h-5 w-5 shrink-0 opacity-90" />
              Aide
            </Link>
            {user && (
              <button
                type="button"
                className={`${drawerRowClass(false)} border-0 bg-transparent cursor-pointer font-[inherit]`}
                onClick={handleLogout}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0 opacity-90" />
                Déconnexion
              </button>
            )}
          </nav>
        </aside>
      </div>
    </header>
  )
}
