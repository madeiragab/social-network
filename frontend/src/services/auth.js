export const authService = {
  getToken: () => localStorage.getItem('token'),
  
  setToken: (token) => localStorage.setItem('token', token),
  
  logout: () => localStorage.removeItem('token'),
  
  isAuthenticated: () => !!localStorage.getItem('token'),
}
