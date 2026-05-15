import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useAuthModal } from '../contexts/AuthModalContext'
import { validatePasswordForRegister } from '../lib/passwordRules'

export function AuthModals() {
  const { modal, close, openLogin, openRegister, takeRedirectAfterAuth } = useAuthModal()
  const { login, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [modal, close])

  if (!modal) return null

  const goAfterAuth = () => {
    const target = takeRedirectAfterAuth()
    close()
    navigate(target, { replace: true })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modal === 'login' ? 'auth-modal-login-title' : 'auth-modal-register-title'}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
        onClick={close}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#ff3301]/35 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          className="absolute right-3 top-3 rounded-lg p-2 text-gray-500 hover:bg-[#e62d00]/10"
          aria-label="Fermer"
          onClick={close}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {modal === 'login' ? (
          <LoginModalBody
            onSwitchRegister={() => openRegister()}
            onLoggedIn={() => {
              toast.success('Connexion réussie.')
              goAfterAuth()
            }}
            login={login}
          />
        ) : (
          <RegisterModalBody
            onSwitchLogin={() => openLogin()}
            onRegistered={() => {
              toast.success('Compte créé. Bienvenue !')
              goAfterAuth()
            }}
            register={register}
          />
        )}
      </div>
    </div>
  )
}

type LoginFn = (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>

function LoginModalBody({
  onSwitchRegister,
  onLoggedIn,
  login,
}: {
  onSwitchRegister: () => void
  onLoggedIn: () => void
  login: LoginFn
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result.ok === false) {
        toast.error(result.message)
        return
      }
      onLoggedIn()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h2 id="auth-modal-login-title" className="pr-10 text-2xl font-bold tracking-tight text-gray-900">
        Connexion
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <button
          type="button"
          onClick={onSwitchRegister}
          className="font-semibold text-[#ff3301] hover:underline"
        >
          Créer un compte
        </button>
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-900" htmlFor="auth-login-email">
            Email
          </label>
          <input
            id="auth-login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#ff3301]/35 px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none ring-[#ff3301] focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900" htmlFor="auth-login-password">
            Mot de passe
          </label>
          <input
            id="auth-login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#ff3301]/35 px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none ring-[#ff3301] focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#ff3301] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e62d00] disabled:opacity-60"
        >
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </>
  )
}

type RegisterFn = (
  email: string,
  password: string,
  displayName: string,
) => Promise<{ ok: true } | { ok: false; message: string }>

function RegisterModalBody({
  onSwitchLogin,
  onRegistered,
  register,
}: {
  onSwitchLogin: () => void
  onRegistered: () => void
  register: RegisterFn
}) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pwdErr = validatePasswordForRegister(password)
    if (pwdErr) {
      toast.error(pwdErr)
      return
    }
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    setSubmitting(true)
    try {
      const result = await register(email, password, displayName)
      if (result.ok === false) {
        toast.error(result.message)
        return
      }
      onRegistered()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h2 id="auth-modal-register-title" className="pr-10 text-2xl font-bold tracking-tight text-gray-900">
        Inscription
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Déjà inscrit ?{' '}
        <button type="button" onClick={onSwitchLogin} className="font-semibold text-[#ff3301] hover:underline">
          Se connecter
        </button>
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-900" htmlFor="auth-reg-name">
            Nom affiché
          </label>
          <input
            id="auth-reg-name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#ff3301]/35 px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none ring-[#ff3301] focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900" htmlFor="auth-reg-email">
            Email
          </label>
          <input
            id="auth-reg-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#ff3301]/35 px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none ring-[#ff3301] focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900" htmlFor="auth-reg-password">
            Mot de passe
          </label>
          <input
            id="auth-reg-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#ff3301]/35 px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none ring-[#ff3301] focus:ring-2"
          />
          <p className="mt-1 text-xs text-gray-500">8 caractères minimum, une lettre et un chiffre.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900" htmlFor="auth-reg-confirm">
            Confirmer le mot de passe
          </label>
          <input
            id="auth-reg-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#ff3301]/35 px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none ring-[#ff3301] focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#ff3301] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e62d00] disabled:opacity-60"
        >
          {submitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </>
  )
}
