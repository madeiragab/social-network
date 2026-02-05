import { useState, useEffect } from 'react'
import { authService } from './services/auth'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import FeedPage from './pages/FeedPage'

export default function App() {
  const [page, setPage] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = authService.getToken()
    if (token) {
      setIsAuthenticated(true)
      setPage('feed')
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setPage('feed')
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setPage('login')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full">
        {page === 'login' ? (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onSwitchPage={() => setPage('signup')}
          />
        ) : (
          <SignupPage 
            onSignupSuccess={() => setPage('login')}
            onSwitchPage={() => setPage('login')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full">
      <FeedPage onLogout={handleLogout} />
    </div>
  )
}
