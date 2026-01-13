import { ENV } from './env'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
  BaseQueryApi
} from '@reduxjs/toolkit/dist/query'
import { hideLoading, showLoading } from '@utils/events'
import { notification } from 'antd'
import { t } from 'i18next'
import Cookies from 'js-cookie'

import {
  HttpStatus,
  NotificationType,
  FETCH_ERROR,
  CookieKey,
  CookieExpiry,
  TokenType,
  RefreshResponse,
  ApiErrorResponse,
  RequestArgs,
  isInWhiteList,
  normalizePathname,
  callApi
} from './fetchBaseQuery.types'

// ============================================================================
// STATE - Token Refresh Singleton
// ============================================================================

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

// ============================================================================
// NOTIFICATION HELPER
// ============================================================================

/**
 * Display notification to user
 * @param message - Message key for translation
 * @param messageType - Type of notification (default: error)
 */
export const openNotification = (
  message: string,
  messageType: NotificationType = NotificationType.ERROR
): void => {
  const config = {
    message: t(message),
    placement: 'top' as const
  }

  switch (messageType) {
    case NotificationType.WARNING:
      notification.warning(config)
      break
    case NotificationType.INFO:
      notification.info(config)
      break
    case NotificationType.SUCCESS:
      notification.success(config)
      break
    case NotificationType.ERROR:
    default:
      notification.error({ ...config, style: { width: 400 } })
      break
  }
}

// ============================================================================
// BASE QUERY CONFIGURATIONS
// ============================================================================

const baseAuthQuery = fetchBaseQuery({
  baseUrl: ENV.API_LOGIN,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const accessToken = Cookies.get(CookieKey.ACCESS_TOKEN)
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }
    return headers
  }
})

const baseRefreshQuery = fetchBaseQuery({
  baseUrl: ENV.API_LOGIN,
  credentials: 'include'
})

const baseQueryOld = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const accessToken = Cookies.get(CookieKey.ACCESS_TOKEN)
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }
    return headers
  }
})


export const baseQueryFee = fetchBaseQuery({
  baseUrl: ENV.API_FEE,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const accessToken = Cookies.get(CookieKey.ACCESS_TOKEN)
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }
    return headers
  }
})
export const baseQueryWalletCore  = fetchBaseQuery({
  baseUrl: ENV.API_WALLETCORE,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const accessToken = Cookies.get(CookieKey.ACCESS_TOKEN)
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }
    return headers
  }
})



// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * Refresh access token using refresh token stored in cookies
 * Uses singleton pattern to prevent multiple simultaneous refresh requests
 */



const refreshAccessToken = async (
  api: BaseQueryApi,
  extraOptions: Record<string, unknown>
): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true

  refreshPromise = (async () => {
    try {
      const refreshToken = Cookies.get(CookieKey.REFRESH_TOKEN)
      if (!refreshToken) return null

      const refreshResult = await callApi<RefreshResponse>(
        baseRefreshQuery,
        { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
        api,
        extraOptions
      )

      const data = refreshResult?.data
      const newAccessToken = data?.[TokenType.ACCESS_TOKEN]

      if (!newAccessToken) return null

      // Sử dụng expiresIn từ API (đơn vị giây), fallback 300 giây
      const expiresInSeconds = data?.[TokenType.EXPIRES_IN] || CookieExpiry.ACCESS_TOKEN_SECONDS
      const expiresInDays = expiresInSeconds / 86400
      Cookies.set(CookieKey.ACCESS_TOKEN, newAccessToken, { expires: expiresInDays })

      if (data?.[TokenType.REFRESH_TOKEN]) {
        // Sử dụng refreshExpiresIn từ API (đơn vị giây), fallback 1800 giây
        const refreshExpiresInSeconds = data?.[TokenType.REFRESH_EXPIRES_IN] || CookieExpiry.REFRESH_TOKEN_SECONDS
        const refreshExpiresInDays = refreshExpiresInSeconds / 86400
        Cookies.set(CookieKey.REFRESH_TOKEN, data[TokenType.REFRESH_TOKEN], { expires: refreshExpiresInDays })
      }

      return newAccessToken
    } catch (error) {
      console.error('[Auth] Refresh token failed:', error)
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}


const forceLogout = (): void => {
  Cookies.remove(CookieKey.ACCESS_TOKEN)
  Cookies.remove(CookieKey.REFRESH_TOKEN)
  window.location.href = '/auth/login'
}

// ============================================================================
// FACTORY FUNCTION - Create custom base query with loading & error handling
// ============================================================================

/**
 * Factory function to create custom base query with:
 * - Loading indicator management (with whitelist)
 * - Automatic token refresh on 401 Unauthorized
 * - Error notification handling
 * 
 * @param baseQuery - The base fetch query to wrap
 * @returns Custom base query function
 */
const createCustomBaseQuery = (
  baseQuery: ReturnType<typeof fetchBaseQuery>
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return async (args, api, extraOptions) => {
    const pathName = normalizePathname(window.location.pathname)

    const requestArgs = args as RequestArgs
    const isLoading = requestArgs?.params?.isLoading
    const requestUrl = typeof args === 'string' ? args : requestArgs?.url

    if (isLoading !== false && !isInWhiteList(requestUrl, pathName)) {
      showLoading()
    }

    const result = await baseQuery(args, api, extraOptions)
    hideLoading()

    if (result.error && result.error.status) {
      const status = result.error.status

      switch (status) {
        case HttpStatus.UNAUTHORIZED: {
          const newAccessToken = await refreshAccessToken(api, extraOptions as Record<string, unknown>)

          if (!newAccessToken) {
            forceLogout()
            break
          }

          return await baseQuery(args, api, extraOptions)
        }

        case HttpStatus.BAD_REQUEST: {
          const errorData = result.error.data as ApiErrorResponse
          if (errorData?.message) {
            openNotification(errorData.message)
          }
          break
        }

        case FETCH_ERROR:
          break

        default: {
          const errorData = result.error.data as ApiErrorResponse
          if (errorData?.message) {
            openNotification(errorData.message)
          }
          break
        }
      }
    }

    return result
  }
}

// ============================================================================
// EXPORTED CUSTOM BASE QUERIES
// ============================================================================
export const fetchBaseQueryCustom = createCustomBaseQuery(baseAuthQuery)
export const fetchBaseQueryFee = createCustomBaseQuery(baseQueryFee)
export const fetchBaseQueryOld = createCustomBaseQuery(baseQueryOld)
export const fetchBaseQueryWalletCore = createCustomBaseQuery(baseQueryWalletCore)

