/*
API service layer:

- Centralize all HTTP requests
- Use REST endpoints
- Handle auth token automatically
- Do not embed business logic here
*/
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  signup: (username, email, password) =>
    apiClient.post('/users/', { username, email, password }),
  login: (username, password) =>
    apiClient.post('/auth/token/', { username, password }),
}

export const postsService = {
  list: (params) => apiClient.get('/posts/', { params }),
  create: (data) => apiClient.post('/posts/', data),
  retrieve: (id) => apiClient.get(`/posts/${id}/`),
  update: (id, data) => apiClient.patch(`/posts/${id}/`, data),
  delete: (id) => apiClient.delete(`/posts/${id}/`),
}

export const reactionsService = {
  create: (postId, reactionType) =>
    apiClient.post('/reactions/', { post: postId, reaction_type: reactionType }),
  delete: (reactionId) =>
    apiClient.delete(`/reactions/${reactionId}/`),
}

export const usersService = {
  follow: (userId) =>
    apiClient.post(`/users/${userId}/follow/`),
  unfollow: (userId) =>
    apiClient.post(`/users/${userId}/unfollow/`),
  retrieve: (id) =>
    apiClient.get(`/users/${id}/`),
}

export default apiClient