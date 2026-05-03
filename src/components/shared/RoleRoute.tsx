import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/api'

interface RoleRouteProps {
  roles: UserRole[]
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { isAuthenticated, hasRole } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasRole(...roles)) return <Navigate to="/" replace />
  return <Outlet />
}
