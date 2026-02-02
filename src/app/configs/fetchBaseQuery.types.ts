import {
    BANKANDCONNECT,
    FEEMANAGEMENT,
    FEEMANAGEMENT_V3,
    INTERNAL_WALLET,
    PERSONALWALLET,
    PRODUCTS,
    ROLEMANAGEMENT,
    ROLEMANAGEMENT_V2,
    WALLETADMINISTRATION
} from '@constants/routersConstant'
import { BaseQueryApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import Cookies from 'js-cookie'

// ============================================================================
// ENUMS
// ============================================================================


export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}


export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

export enum TokenType {
    ACCESS_TOKEN = 'accessToken',
    REFRESH_TOKEN = 'refreshToken',
    EXPIRES_IN = 'expiresIn',
    REFRESH_EXPIRES_IN = 'refreshExpiresIn'
}

/**
 * Cookie storage keys (snake_case for cookie naming convention)
 */
export enum CookieKey {
    ACCESS_TOKEN = 'access_token',
    REFRESH_TOKEN = 'refresh_token'
}

// ============================================================================
// COOKIE HELPER FUNCTIONS (với security options)
// ============================================================================

/**
 * Default cookie options với security settings
 * - secure: Chỉ gửi qua HTTPS (production)
 * - sameSite: 'strict' để chống CSRF
 */
const getCookieOptions = (expiresInHours: number = 1): Cookies.CookieAttributes => ({
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
    expires: expiresInHours / 24, // js-cookie expects days
    path: '/'
})

/**
 * Set access token cookie với security options
 * @param token - Access token string
 * @param expiresInSeconds - Token expiration in seconds (default: 300 = 5 minutes)
 */
export const setAccessTokenCookie = (token: string, expiresInSeconds: number = 300): void => {
    const expiresInDays = expiresInSeconds / 86400 // Convert seconds to days (86400 = 24*60*60)
    Cookies.set(CookieKey.ACCESS_TOKEN, token, {
        secure: window.location.protocol === 'https:',
        sameSite: 'strict',
        expires: expiresInDays,
        path: '/'
    })
}

/**
 * Get access token from cookie
 */
export const getAccessTokenCookie = (): string | undefined => {
    return Cookies.get(CookieKey.ACCESS_TOKEN)
}

/**
 * Remove access token cookie
 */
export const removeAccessTokenCookie = (): void => {
    Cookies.remove(CookieKey.ACCESS_TOKEN, { path: '/' })
}

/**
 * Set refresh token cookie với security options
 * @param token - Refresh token string  
 * @param expiresInSeconds - Token expiration in seconds (default: 1800 = 30 minutes)
 */
export const setRefreshTokenCookie = (token: string, expiresInSeconds: number = 1800): void => {
    const expiresInDays = expiresInSeconds / 86400 // Convert seconds to days
    Cookies.set(CookieKey.REFRESH_TOKEN, token, {
        secure: window.location.protocol === 'https:',
        sameSite: 'strict',
        expires: expiresInDays,
        path: '/'
    })
}

/**
 * Get refresh token from cookie
 */
export const getRefreshTokenCookie = (): string | undefined => {
    return Cookies.get(CookieKey.REFRESH_TOKEN)
}

/**
 * Remove refresh token cookie
 */
export const removeRefreshTokenCookie = (): void => {
    Cookies.remove(CookieKey.REFRESH_TOKEN, { path: '/' })
}

/**
 * Remove all auth cookies (for logout)
 */
export const removeAllAuthCookies = (): void => {
    removeAccessTokenCookie()
    removeRefreshTokenCookie()
}

// Default expiry values in SECONDS (matching API response format)
export const CookieExpiry = {
    ACCESS_TOKEN_SECONDS: 300,    // 5 minutes
    REFRESH_TOKEN_SECONDS: 1800   // 30 minutes  
} as const


export const FETCH_ERROR = 'FETCH_ERROR' as const

// ============================================================================
// INTERFACES
// ============================================================================


export interface WhiteListItem {
    pathname: string
    requestUrl: string
}


export interface TokenData {
    accessToken: string
    expiresIn: number
    refreshToken: string
    refreshExpiresIn: number
}


export interface RefreshResponse {
    data: TokenData
    message: string
    detail: string
    success: boolean
    status: string
}


export interface ApiErrorResponse {
    message?: string
    detail?: string
}


export interface RequestArgs {
    url?: string
    params?: {
        isLoading?: boolean
        [key: string]: unknown
    }
    [key: string]: unknown
}

// ============================================================================
// CONSTANTS - Whitelist for loading indicator
// ============================================================================


export const WHITE_LIST: WhiteListItem[] = [
    { pathname: PERSONALWALLET + '/customers-group', requestUrl: '/customer' },

    { pathname: PRODUCTS + '/sales-fee', requestUrl: '/service/services' },
    { pathname: PRODUCTS + '/sales-fee', requestUrl: '/service' },
    { pathname: PRODUCTS + '/sales-fee', requestUrl: '/account-group' },
    { pathname: PRODUCTS + '/sales-fee', requestUrl: '/customer' },

    { pathname: PRODUCTS + '/product-discount', requestUrl: '/service/services' },
    { pathname: PRODUCTS + '/product-discount', requestUrl: '/service' },
    { pathname: PRODUCTS + '/product-discount', requestUrl: '/account-group' },
    { pathname: PRODUCTS + '/product-discount', requestUrl: '/customer' },

    { pathname: FEEMANAGEMENT + '/e-wallet-transfer-money', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/e-wallet-transfer-money', requestUrl: '/customer' },

    { pathname: FEEMANAGEMENT + '/direct-deposit', requestUrl: '/bank/find-all-active' },
    { pathname: FEEMANAGEMENT + '/direct-deposit', requestUrl: '/user' },
    { pathname: FEEMANAGEMENT + '/direct-deposit', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/direct-deposit', requestUrl: '/customer' },

    { pathname: FEEMANAGEMENT + '/withdraw-money', requestUrl: '/bank/find-all-active' },
    { pathname: FEEMANAGEMENT + '/withdraw-money', requestUrl: '/user' },
    { pathname: FEEMANAGEMENT + '/withdraw-money', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/withdraw-money', requestUrl: '/customer' },

    { pathname: FEEMANAGEMENT + '/limit-regulations', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/limit-regulations', requestUrl: '/customer' },
    { pathname: FEEMANAGEMENT + '/limit-regulations', requestUrl: '/user' },

    { pathname: FEEMANAGEMENT + '/account-bank-payment', requestUrl: '/bank/find-all-active' },
    { pathname: FEEMANAGEMENT + '/account-bank-payment', requestUrl: '/user' },
    { pathname: FEEMANAGEMENT + '/account-bank-payment', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/account-bank-payment', requestUrl: '/customer' },

    { pathname: FEEMANAGEMENT + '/payment', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/payment', requestUrl: '/customer' },

    { pathname: BANKANDCONNECT + '/notification-management', requestUrl: '/customer' },
    { pathname: BANKANDCONNECT + '/notification-management', requestUrl: '/account-group' },

    { pathname: ROLEMANAGEMENT + '/manage-group-permissions', requestUrl: '/group-permission' },

    { pathname: INTERNAL_WALLET + '/account', requestUrl: '/balance-internal-group' },
    { pathname: FEEMANAGEMENT_V3 + '/fee-management', requestUrl: '/fee/policies' },
    { pathname: FEEMANAGEMENT_V3 + '/fee-assignment', requestUrl: '/fee/policy-assignments' },
    { pathname: FEEMANAGEMENT_V3 + '/fee-assignment', requestUrl: '/fee/banks' },

    { pathname: ROLEMANAGEMENT_V2 + '/user-account', requestUrl: '/roles' },
    { pathname: ROLEMANAGEMENT_V2 + '/user-account', requestUrl: '/users/managers' },
    { pathname: ROLEMANAGEMENT_V2 + '/permission-management', requestUrl: '/permissions' },
    { pathname: ROLEMANAGEMENT_V2 + '/permission-management', requestUrl: '/roles' },
    { pathname: ROLEMANAGEMENT_V2 + '/role-management', requestUrl: '/permissions' },
    { pathname: ROLEMANAGEMENT_V2 + '/role-management', requestUrl: '/roles' },



    // { pathname: WALLETADMINISTRATION + '/role-management', requestUrl: '/wallet/transactions' },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================


// export const isInWhiteList = (url?: string, pathname?: string): WhiteListItem | undefined => {
//     console.log(WHITE_LIST.find((item) => item.pathname === pathname && item.requestUrl === url))
//     return WHITE_LIST.find((item) => item.pathname === pathname && item.requestUrl === url)
// }


const normalizeUrl = (url?: string) => {
  if (!url) return ''
  return url.startsWith('/') ? url : `/${url}`
}

export const isInWhiteList = (
  url?: string,
  pathname?: string
): WhiteListItem | undefined => {
  const cleanUrl = normalizeUrl(url)

  return WHITE_LIST.find(
    (item) =>
      item.pathname === pathname &&
      cleanUrl.startsWith(item.requestUrl)
  )
}


export const normalizePathname = (pathname: string): string => {
    return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}


// ============================================================================
// GENERIC API HELPER
// ============================================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiConfig {
    url: string
    method: HttpMethod
    body?: unknown
}

export const callApi = async <TResponse>(
    baseQuery: ReturnType<typeof fetchBaseQuery>,
    config: ApiConfig,
    api: BaseQueryApi,
    extraOptions: Record<string, unknown>
): Promise<TResponse | null> => {
    const result = await baseQuery(config, api, extraOptions)
    if (result.error) return null
    return result.data as TResponse
}