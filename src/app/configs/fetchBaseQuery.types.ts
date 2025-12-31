import {
    BANKANDCONNECT,
    FEEMANAGEMENT,
    INTERNAL_WALLET,
    PERSONALWALLET,
    PRODUCTS,
    ROLEMANAGEMENT
} from '@constants/routersConstant'

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
 * @param expiresInMinutes - Token expiration in minutes (default: 5 minutes)
 */
export const setAccessTokenCookie = (token: string, expiresInMinutes: number = 5): void => {
    const expiresInDays = expiresInMinutes / (60 * 24) // Convert minutes to days
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
 * @param expiresInHours - Token expiration in hours (default: 24 hours)
 */
export const setRefreshTokenCookie = (token: string, expiresInHours: number = 1): void => {
    Cookies.set(CookieKey.REFRESH_TOKEN, token, getCookieOptions(expiresInHours))
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

export const CookieExpiry = {
    ACCESS_TOKEN_MINUTES: 5,
    REFRESH_TOKEN_MINUTES: 60
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

    { pathname: INTERNAL_WALLET + '/account', requestUrl: '/balance-internal-group' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================


export const isInWhiteList = (url?: string, pathname?: string): WhiteListItem | undefined => {
    return WHITE_LIST.find((item) => item.pathname === pathname && item.requestUrl === url)
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