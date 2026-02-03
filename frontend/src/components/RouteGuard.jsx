/*
Route guard component:

- Redirect unauthenticated users to login
- Redirect authenticated users to feed
- Show loading state while checking auth
*/

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />
  }

  return children
}
