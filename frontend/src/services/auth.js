export const authService = {
  getToken: () => localStorage.getItem('access_token'),
  
  setToken: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  },
  
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
  
  isAuthenticated: () => !!localStorage.getItem('access_token'),
  
  getRefreshToken: () => localStorage.getItem('refresh_token'),
}
