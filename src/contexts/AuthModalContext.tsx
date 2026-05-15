import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate, type Location as RouterLocation } from 'react-router-dom'

type AuthModal = 'login' | 'register' | null

type OpenOpts = {
  /** Après connexion ou inscription réussie (ommettre l’objet pour ne pas changer la cible en cours) */
  redirectTo?: string | null
}

type AuthModalLocationState = {
  openAuth?: 'login' | 'register'
  from?: Pick<RouterLocation, 'pathname' | 'search' | 'hash'>
}

function shouldSetRedirect(opts?: OpenOpts): opts is OpenOpts & { redirectTo?: string | null } {
  return opts !== undefined && 'redirectTo' in opts
}

type AuthModalContextValue = {
  modal: AuthModal
  openLogin: (opts?: OpenOpts) => void
  openRegister: (opts?: OpenOpts) => void
  close: () => void
  takeRedirectAfterAuth: () => string
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<AuthModal>(null)
  const pendingRedirectRef = useRef<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const openLogin = useCallback((opts?: OpenOpts) => {
    if (shouldSetRedirect(opts)) {
      pendingRedirectRef.current = opts.redirectTo ?? null
    }
    setModal('login')
  }, [])

  const openRegister = useCallback((opts?: OpenOpts) => {
    if (shouldSetRedirect(opts)) {
      pendingRedirectRef.current = opts.redirectTo ?? null
    }
    setModal('register')
  }, [])

  const takeRedirectAfterAuth = useCallback(() => {
    const p = pendingRedirectRef.current
    pendingRedirectRef.current = null
    if (p && p.length > 0 && p !== '/') return p
    return '/dashboard'
  }, [])

  const close = useCallback(() => {
    setModal(null)
    pendingRedirectRef.current = null
  }, [])

  useEffect(() => {
    const st = location.state as AuthModalLocationState | null
    if (!st?.openAuth) return

    const from = st.from
    const redirect =
      from?.pathname && from.pathname !== '/'
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : null

    if (st.openAuth === 'login') {
      openLogin(redirect ? { redirectTo: redirect } : {})
    } else {
      openRegister(redirect ? { redirectTo: redirect } : {})
    }

    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { replace: true, state: {} },
    )
  }, [location.state, location.pathname, location.search, location.hash, navigate, openLogin, openRegister])

  const value = useMemo(
    () => ({ modal, openLogin, openRegister, close, takeRedirectAfterAuth }),
    [modal, openLogin, openRegister, close, takeRedirectAfterAuth],
  )

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) {
    throw new Error('useAuthModal doit être utilisé dans AuthModalProvider')
  }
  return ctx
}
