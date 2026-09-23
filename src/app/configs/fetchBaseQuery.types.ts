import {
    AUTHENTICATION,
    BANKANDCONNECT,
    FEEMANAGEMENT,
    FEEMANAGEMENT_V4,
    INTERNAL_WALLET,
    ROLEMANAGEMENT,
    ROLEMANAGEMENT_V2,
    TRANSACTIONMANAGEMENT,
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
 * Lưu access token vào cookie cho suốt phiên đăng nhập.
 *
 * Cookie chỉ là nơi CHỨA token để gắn vào header Authorization, không phải nơi
 * quyết định token còn hiệu lực hay không. Nếu cho cookie hết hạn đúng bằng tuổi
 * thọ access token (mặc định 300s) thì sau 5 phút cookie biến mất, request bị
 * gửi đi THIẾU header Authorization và server trả 401. Token hết hạn đã có luồng
 * refresh trong fetchBaseQueryCustom xử lý, nên cookie sống theo refresh token.
 *
 * @param token - Access token string
 * @param refreshExpiresInSeconds - Tuổi thọ refresh token (giây)
 */
export const persistAccessTokenCookie = (
    token: string,
    refreshExpiresInSeconds: number = CookieExpiry.REFRESH_TOKEN_SECONDS
): void => {
    Cookies.set(CookieKey.ACCESS_TOKEN, token, {
        expires: refreshExpiresInSeconds / 86400,
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


interface WhiteListItemBase {
    pathname: string
    includeNestedPaths?: boolean
}

/** Mỗi whitelist entry bắt buộc chọn chính xác một kiểu so khớp URL. */
export type WhiteListItem = WhiteListItemBase & (
  | {
      /** So khớp theo tiền tố URL. */
      requestUrl: string
      requestUrlEndsWith?: never
    }
  | {
      requestUrl?: never
      /** So khớp theo hậu tố URL — dùng khi id nằm giữa đường dẫn. */
      requestUrlEndsWith: string
    }
)


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
    // Đặt lại mật khẩu tự hiển thị trạng thái của mình (đang kiểm tra liên kết,
    // nút đang gửi) — overlay loading toàn màn sẽ che mất chính các trạng thái đó.
    {
      pathname: AUTHENTICATION + '/forgot-password',
      requestUrl: '/auth/forgot-password'
    },
    {
      pathname: AUTHENTICATION + '/forget-password',
      requestUrl: '/auth/forgot-password'
    },
    {
      pathname: AUTHENTICATION + '/reset-password',
      requestUrl: '/auth/reset-password'
    },


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
    {
      // Modal chọn ví tự hiển thị loading trong bảng; không phủ global loader
      // khi mở modal, phân trang hoặc tìm theo số điện thoại.
      pathname: FEEMANAGEMENT_V4 + '/fee-policy',
      requestUrl: '/wallet/accounts',
      includeNestedPaths: true
    },
    {
      pathname: FEEMANAGEMENT_V4 + '/fee-policy',
      requestUrl: '/fee/policies/search',
      includeNestedPaths: true
    },
    {
      pathname: FEEMANAGEMENT_V4 + '/fee-policy',
      requestUrl: '/fee/policies/export',
      includeNestedPaths: true
    },
    {
      pathname: FEEMANAGEMENT_V4 + '/fee-policy',
      requestUrl: '/fee/banks',
      includeNestedPaths: true
    },
    { pathname: FEEMANAGEMENT_V4 + '/fee-management', requestUrl: '/fee/policies' },
    { pathname: FEEMANAGEMENT_V4 + '/fee-assignment', requestUrl: '/fee/policy-assignments' },
    { pathname: FEEMANAGEMENT_V4 + '/fee-assignment', requestUrl: '/fee/banks' },

    { pathname: ROLEMANAGEMENT_V2 + '/user-account', requestUrl: '/roles' },
    { pathname: ROLEMANAGEMENT_V2 + '/user-account', requestUrl: '/users/managers' },
    { pathname: ROLEMANAGEMENT_V2 + '/permission-management', requestUrl: '/permissions' },
    { pathname: ROLEMANAGEMENT_V2 + '/permission-management', requestUrl: '/roles' },
    { pathname: ROLEMANAGEMENT_V2 + '/role-management', requestUrl: '/permissions' },
    { pathname: ROLEMANAGEMENT_V2 + '/role-management', requestUrl: '/roles' },

    { pathname: WALLETADMINISTRATION + '/e-walletManagement', requestUrl: '/wallet/accounts' },
    {
      pathname: WALLETADMINISTRATION + '/e-walletManagement',
      requestUrl: '/bank-links',
      includeNestedPaths: true
    },
    {
      pathname: WALLETADMINISTRATION + '/e-walletManagement',
      requestUrl: '/user-wallets/',
      includeNestedPaths: true
    },
    { pathname: WALLETADMINISTRATION + '/transaction-wallet', requestUrl: '/wallet/transactions' },

    { pathname: TRANSACTIONMANAGEMENT + '/transaction-wallet', requestUrl: '/wallet/journal/unified' },
    { pathname: TRANSACTIONMANAGEMENT + '/frozen-transactions', requestUrl: '/wallet/freezes' },
    { pathname: TRANSACTIONMANAGEMENT + '/system-ledger', requestUrl: '/wallet/entries' },
    { pathname: TRANSACTIONMANAGEMENT + '/withdraw-history', requestUrl: '/wallet/journal/unified' },


    // Nút export tự hiển thị spinner nên overlay toàn màn chỉ gây nhấp nháy.
    {
      pathname: WALLETADMINISTRATION + '/e-walletManagement',
      requestUrlEndsWith: '/export',
      includeNestedPaths: true
    },
    {
      pathname: WALLETADMINISTRATION + '/confirm-eKYC',
      requestUrlEndsWith: '/export'
    },

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

const PASSWORD_RESET_REQUEST_URLS = [
  '/auth/forgot-password',
  '/auth/reset-password'
] as const

export const isPasswordResetRequest = (url?: string): boolean => {
  const cleanUrl = normalizeUrl(url)
  return PASSWORD_RESET_REQUEST_URLS.some((requestUrl) =>
    cleanUrl.startsWith(requestUrl)
  )
}

export const isAdminChangePasswordRequest = (url?: string): boolean =>
  normalizeUrl(url).startsWith('/auth/change-password')

const OPAQUE_ERROR_URL_PREFIXES = ['/withdrawals'] as const
const OPAQUE_ERROR_URL_SUFFIXES = ['/update-status'] as const

/**
 * Endpoint mà `message` của BE là mã máy, không phải câu nói được với người dùng.
 *
 * Bộ bắt lỗi chung của user-wallet nuốt mất mô tả cụ thể và luôn trả
 * `BUSINESS_ERROR`; đổ nguyên chuỗi đó lên notification là hiện raw response.
 * Những request này vẫn đi qua luồng refresh token 401 như mọi request khác —
 * chỉ notification tập trung bị tắt để màn tự diễn giải theo trạng thái đọc lại.
 */
export const suppressesErrorNotification = (url?: string): boolean => {
  const cleanUrl = normalizeUrl(url)
  return (
    OPAQUE_ERROR_URL_PREFIXES.some((prefix) => cleanUrl.startsWith(prefix)) ||
    OPAQUE_ERROR_URL_SUFFIXES.some((suffix) => cleanUrl.endsWith(suffix))
  )
}

const matchesRequestUrl = (
  item: WhiteListItem,
  cleanUrl: string
): boolean => {
  if (item.requestUrl !== undefined) {
    return cleanUrl.startsWith(item.requestUrl)
  }
  return cleanUrl.endsWith(item.requestUrlEndsWith)
}

export const isInWhiteList = (
  url?: string,
  pathname?: string
): WhiteListItem | undefined => {
  const cleanUrl = normalizeUrl(url)

  return WHITE_LIST.find(
    (item) =>
      (
        item.pathname === pathname ||
        (
          item.includeNestedPaths &&
          pathname?.startsWith(`${item.pathname}/`)
        )
      ) &&
      matchesRequestUrl(item, cleanUrl)
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
