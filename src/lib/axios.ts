import axios from 'axios'
import i18n from './i18n'

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and language
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Set Accept-Language header based on current i18n language
    // Map 'ua' to 'ua' and 'en' to 'en' for backend
    const language = i18n.language === 'ua' ? 'ua' : 'en'
    config.headers['Accept-Language'] = language
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_role')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

