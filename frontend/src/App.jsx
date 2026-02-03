import { useState, useEffect } from 'react'
import { authService } from './services/auth'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import FeedPage from './pages/FeedPage'
import './styles/App.css'

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
      <div className="app">
        {page === 'login' ? (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onSwitchPage={() => setPage('signup')}
          />
        ) : (
          <SignupPage 
            onSignupSuccess={handleLoginSuccess}
            onSwitchPage={() => setPage('login')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <FeedPage onLogout={handleLogout} />
    </div>
  )
}
