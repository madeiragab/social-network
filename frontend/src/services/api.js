import axios from 'axios'
import { authService } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      authService.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const handleError = (error) => {
  // Return a normalized error object
  if (error.response?.data) {
    return error.response.data
  }
  return { detail: error.message || 'An error occurred' }
}

export const authAPI = {
  signup: (username, email, password) =>
    api.post('/users/', { username, email, password }).catch(handleError),
  login: (username, password) =>
    api.post('/auth/token/', { username, password }).catch(handleError),
}

export const postsAPI = {
  list: (params) => api.get('/posts/', { params }).catch(handleError),
  create: (data) => api.post('/posts/', data).catch(handleError),
  retrieve: (id) => api.get(`/posts/${id}/`).catch(handleError),
  update: (id, data) => api.patch(`/posts/${id}/`, data).catch(handleError),
  delete: (id) => api.delete(`/posts/${id}/`).catch(handleError),
}

export const reactionsAPI = {
  create: (postId, reactionType) =>
    api.post('/reactions/', { post: postId, reaction_type: reactionType }).catch(handleError),
  delete: (reactionId) =>
    api.delete(`/reactions/${reactionId}/`).catch(handleError),
}

export const usersAPI = {
  me: () => api.get('/users/me/').catch(handleError),
  follow: (userId) =>
    api.post(`/users/${userId}/follow/`).catch(handleError),
  unfollow: (userId) =>
    api.post(`/users/${userId}/unfollow/`).catch(handleError),
  retrieve: (id) =>
    api.get(`/users/${id}/`).catch(handleError),
}

export const profileAPI = {
  me: () => api.get('/users/profiles/me/'),
  update: (data) => api.patch('/users/profiles/me/', data),
  removeAvatar: () => api.delete('/users/profiles/me/avatar/'),
}

export default api
