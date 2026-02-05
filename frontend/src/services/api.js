import axios from 'axios'

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

export const authAPI = {
  signup: (username, email, password) =>
    api.post('/users/', { username, email, password }),
  login: (username, password) =>
    api.post('/auth/token/', { username, password }),
}

export const postsAPI = {
  list: (params) => api.get('/posts/', { params }),
  create: (data) => api.post('/posts/', data),
  retrieve: (id) => api.get(`/posts/${id}/`),
  update: (id, data) => api.patch(`/posts/${id}/`, data),
  delete: (id) => api.delete(`/posts/${id}/`),
}

export const reactionsAPI = {
  create: (postId, reactionType) =>
    api.post('/reactions/', { post: postId, reaction_type: reactionType }),
  delete: (reactionId) =>
    api.delete(`/reactions/${reactionId}/`),
}

export const usersAPI = {
  follow: (userId) =>
    api.post(`/users/${userId}/follow/`),
  unfollow: (userId) =>
    api.post(`/users/${userId}/unfollow/`),
  retrieve: (id) =>
    api.get(`/users/${id}/`),
}

export default api
