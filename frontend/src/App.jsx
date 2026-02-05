import { useState, useEffect } from 'react'
import { authService } from './services/auth'
import { usersAPI } from './services/api'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'

export default function App() {
  const [page, setPage] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = () => {
    const token = authService.getToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const isExpired = payload.exp * 1000 < Date.now()
        
        if (!isExpired) {
          setIsAuthenticated(true)
          setPage('feed')
          fetchCurrentUser()
        } else {
          authService.logout()
          setIsAuthenticated(false)
          setPage('login')
        }
      } catch (err) {
        authService.logout()
        setIsAuthenticated(false)
        setPage('login')
      }
    }
    setIsLoading(false)
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await usersAPI.me()
      if (response.data) {
        setCurrentUser(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      if (err.response?.status === 401) {
        handleLogout()
      }
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setPage('feed')
    fetchCurrentUser()
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setPage('login')
  }

  const handleProfileUpdate = async () => {
    await fetchCurrentUser()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header 
          onLogout={handleLogout} 
          onNavigateProfile={() => setPage('profile')}
          onNavigateFeed={() => setPage('feed')}
          user={currentUser}
        />
        {page === 'profile' ? (
          <ProfilePage 
            onBack={() => setPage('feed')} 
            onProfileUpdate={handleProfileUpdate}
          />
        ) : (
          <FeedPage 
            currentUser={currentUser}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
