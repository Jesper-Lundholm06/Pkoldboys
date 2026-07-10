import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StateMessage from '../ui/StateMessage'

type ProtectedRouteProps = {
  children: ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return <StateMessage>Laddar…</StateMessage>
  }

  if (!user) {
    return <Navigate to="/logga-in" replace />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <StateMessage variant="error">
        Du har inte behörighet till denna sida.
      </StateMessage>
    )
  }

  return <>{children}</>
}
