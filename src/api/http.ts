import axios from 'axios'
import type{
    AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

/**
 * =========================================================
 * HTTP CLIENT - React + TypeScript
 * =========================================================
 * Features:
 * - Axios instance
 * - Access token management
 * - Auto refresh token
 * - Request/response interceptors
 * - Error normalization
 * - Typed helpers (GET, POST, PUT, PATCH, DELETE)
 * - Upload support
 * - Timeout handling
 * - Optional retry logic
 * - Clean architecture friendly
 * =========================================================
 */

// =========================================================
// ENV
// =========================================================

const rawApiBaseUrl = "http://81.0.220.161:4000/api/v1"
// const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = (rawApiBaseUrl || '/api/v1').replace(/\/+$/, '')

// =========================================================
// STORAGE KEYS
// =========================================================

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// =========================================================
// TYPES
// =========================================================

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: unknown
}

export interface RefreshResponse {
  accessToken: string
  refreshToken?: string
}

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  retry?: boolean
}

// =========================================================
// TOKEN HELPERS
// =========================================================

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// =========================================================
// AXIOS INSTANCE
// =========================================================

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// =========================================================
// REFRESH TOKEN STATE
// =========================================================

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })

  failedQueue = []
}

// =========================================================
// REFRESH TOKEN API
// =========================================================

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken()

  if (!refreshToken) {
    throw new Error('No refresh token found')
  }

  const response = await axios.post<RefreshResponse>(
    `${API_BASE_URL}/auth/refresh`,
    {
      refreshToken,
    },
  )

  const { accessToken, refreshToken: newRefreshToken } = response.data

  tokenStorage.setTokens(accessToken, newRefreshToken)

  return accessToken
}

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as InternalAxiosRequestConfig & RequestConfig

    if (customConfig.skipAuth) {
      return config
    }

    const token = tokenStorage.getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

http.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfig & {
      _retry?: boolean
    }

    const status = error.response?.status

    // -----------------------------------------------------
    // TOKEN EXPIRED
    // -----------------------------------------------------

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuth
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }

              resolve(http(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newAccessToken = await refreshAccessToken()

        processQueue(null, newAccessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        return http(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        tokenStorage.clearTokens()

        window.location.href = '/login'

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(normalizeError(error))
  },
)

// =========================================================
// ERROR NORMALIZER
// =========================================================

export const normalizeError = (error: AxiosError): ApiError => {
  if (error.response) {
    const data = error.response.data as {
      message?: string
      code?: string
      details?: unknown
    }

    return {
      status: error.response.status,
      message: data?.message || 'Une erreur est survenue',
      code: data?.code,
      details: data?.details,
    }
  }

  if (error.request) {
    return {
      status: 0,
      message: 'Impossible de contacter le serveur',
    }
  }

  return {
    status: 0,
    message: error.message || 'Erreur inconnue',
  }
}

// =========================================================
// HTTP METHODS
// =========================================================

export const httpClient = {
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await http.get<T>(url, config)
    return response.data
  },

  async post<T, B = unknown>(
    url: string,
    body?: B,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await http.post<T>(url, body, config)
    return response.data
  },

  async put<T, B = unknown>(
    url: string,
    body?: B,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await http.put<T>(url, body, config)
    return response.data
  },

  async patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await http.patch<T>(url, body, config)
    return response.data
  },

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await http.delete<T>(url, config)
    return response.data
  },

  async upload<T>(
    url: string,
    file: File,
    fieldName = 'file',
    config?: RequestConfig,
  ): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)

    const response = await http.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  },
}

// =========================================================
// EXPORTS
// =========================================================

export default http
