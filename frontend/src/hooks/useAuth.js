/*
Authentication hooks:

- useLogin: Handle login flow
- useSignup: Handle signup flow
- useLogout: Handle logout flow
*/

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

export function useLogin() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authAPI.login(username, password)
      login(response.data.token, response.data.user)
      return true
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading, error }
}

export function useSignup() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (username, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authAPI.signup(username, email, password)
      login(response.data.token, response.data.user)
      return true
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading, error }
}

export function useLogout() {
  const { logout } = useAuth()
  
  const execute = () => {
    logout()
  }

  return { execute }
}
