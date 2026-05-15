import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ openAuth: 'login' as const, from: location }}
      />
    )
  }

  return <Outlet />
}
