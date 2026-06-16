import axios from 'axios'

const API_ROOT = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || ''

const api = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
})

const ACCESS_KEY = 'tramspace_access_token'

export function setAccessToken(token) {
  if (token) localStorage.setItem(ACCESS_KEY, token)
  else localStorage.removeItem(ACCESS_KEY)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  return config
})

// Refresh on 401 once
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config
    const authPath = originalRequest.url?.startsWith('/api/auth/') || originalRequest.url?.startsWith('api/auth/')
  if (err.response?.status === 401 && !originalRequest._retry && !authPath) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` }
            return api(originalRequest)
          })
          .catch((e) => { throw e })
      }

      originalRequest._retry = true
      isRefreshing = true
      try {
        const resp = await api.post('/api/auth/refresh')
        const newToken = resp?.data?.data?.accessToken
        setAccessToken(newToken)
        processQueue(null, newToken)
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` }
        return api(originalRequest)
      } catch (e) {
        processQueue(e, null)
        setAccessToken(null)
        throw e
      } finally {
        isRefreshing = false
      }
    }
    throw err
  }
)

// Convenience API wrapper
export default {
  register: (payload) => api.post('/api/auth/register', payload).then((r) => r.data),
  login: async (payload) => {
    const resp = await api.post('/api/auth/login', payload)
    const token = resp?.data?.data?.accessToken
    if (token) setAccessToken(token)
    return resp.data
  },
  refresh: () => api.post('/api/auth/refresh').then((r) => r.data),
  logout: () => api.post('/api/auth/logout').then((r) => { setAccessToken(null); return r.data }),
  getMe: () => api.get('/api/auth/me').then((r) => r.data?.data),
  getHome: () => api.get('/api/home').then((r) => r.data?.data),
  getUser: (handle) => api.get(`/api/users/${handle}`).then((r) => r.data?.data),
  getUserPosts: (userId, limit = 10, offset = 0) =>
    api.get(`/api/posts/users/${userId}/posts`, { params: { limit, offset } }).then((r) => r.data?.data),
  createPost: (content, imageFiles = [], visibility = 'PUBLIC') => {
    const files = Array.isArray(imageFiles) ? imageFiles : imageFiles ? [imageFiles] : []

    if (files.length > 0) {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('visibility', visibility)
      // Append từng ảnh với cùng field name 'images'
      files.forEach((file) => formData.append('images', file))
      return api.post('/api/posts', formData).then((r) => r.data?.data)
    }

    return api.post('/api/posts', { content, visibility }).then((r) => r.data?.data)
  },
  updateProfile: (data) => api.patch('/api/users/me', data).then((r) => r.data?.data),
  updateUsername: (username) => api.patch('/api/users/me/username', { username }).then((r) => r.data),
  _raw: api,
}
