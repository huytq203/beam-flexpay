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

/**
 * HTTP Status codes used in error handling
 */
export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

/**
 * Notification types for UI feedback
 */
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
    REFRESH_TOKEN = 'refresh_token'
}

/**
 * RTK Query fetch error status
 */
export const FETCH_ERROR = 'FETCH_ERROR' as const

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Whitelist item for loading indicator exceptions
 */
export interface WhiteListItem {
    pathname: string
    requestUrl: string
}

/**
 * Token data from refresh API response
 */
export interface TokenData {
    accessToken: string
    expiresIn: number
    refreshToken: string
    refreshExpiresIn: number
}

/**
 * Refresh token API response
 */
export interface RefreshResponse {
    data: TokenData
    message: string
    detail: string
    success: boolean
    status: string
}

/**
 * API error response
 */
export interface ApiErrorResponse {
    message?: string
    detail?: string
}

/**
 * Request args with optional loading flag
 */
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

/**
 * URLs that skip loading indicator
 * Organized by feature for maintainability
 */
export const WHITE_LIST: WhiteListItem[] = [
    // Personal Wallet
    { pathname: PERSONALWALLET + '/customers-group', requestUrl: '/customer' },

    // Products - Sales Fee
    { pathname: PRODUCTS + '/sales-fee', requestUrl: '/service/services' },
    { pathname: PRODUCTS + '/sales-fee', requestUrl: '/service' },
    { pathname: PRODUCTS + '/sales-fee', requestUrl: '/account-group' },
    { pathname: PRODUCTS + '/sales-fee', requestUrl: '/customer' },

    // Products - Product Discount
    { pathname: PRODUCTS + '/product-discount', requestUrl: '/service/services' },
    { pathname: PRODUCTS + '/product-discount', requestUrl: '/service' },
    { pathname: PRODUCTS + '/product-discount', requestUrl: '/account-group' },
    { pathname: PRODUCTS + '/product-discount', requestUrl: '/customer' },

    // Fee Management - E-Wallet Transfer
    { pathname: FEEMANAGEMENT + '/e-wallet-transfer-money', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/e-wallet-transfer-money', requestUrl: '/customer' },

    // Fee Management - Direct Deposit
    { pathname: FEEMANAGEMENT + '/direct-deposit', requestUrl: '/bank/find-all-active' },
    { pathname: FEEMANAGEMENT + '/direct-deposit', requestUrl: '/user' },
    { pathname: FEEMANAGEMENT + '/direct-deposit', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/direct-deposit', requestUrl: '/customer' },

    // Fee Management - Withdraw Money
    { pathname: FEEMANAGEMENT + '/withdraw-money', requestUrl: '/bank/find-all-active' },
    { pathname: FEEMANAGEMENT + '/withdraw-money', requestUrl: '/user' },
    { pathname: FEEMANAGEMENT + '/withdraw-money', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/withdraw-money', requestUrl: '/customer' },

    // Fee Management - Limit Regulations
    { pathname: FEEMANAGEMENT + '/limit-regulations', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/limit-regulations', requestUrl: '/customer' },
    { pathname: FEEMANAGEMENT + '/limit-regulations', requestUrl: '/user' },

    // Fee Management - Account Bank Payment
    { pathname: FEEMANAGEMENT + '/account-bank-payment', requestUrl: '/bank/find-all-active' },
    { pathname: FEEMANAGEMENT + '/account-bank-payment', requestUrl: '/user' },
    { pathname: FEEMANAGEMENT + '/account-bank-payment', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/account-bank-payment', requestUrl: '/customer' },

    // Fee Management - Payment
    { pathname: FEEMANAGEMENT + '/payment', requestUrl: '/account-group' },
    { pathname: FEEMANAGEMENT + '/payment', requestUrl: '/customer' },

    // Bank And Connect
    { pathname: BANKANDCONNECT + '/notification-management', requestUrl: '/customer' },
    { pathname: BANKANDCONNECT + '/notification-management', requestUrl: '/account-group' },

    // Role Management
    { pathname: ROLEMANAGEMENT + '/manage-group-permissions', requestUrl: '/group-permission' },

    // Internal Wallet
    { pathname: INTERNAL_WALLET + '/account', requestUrl: '/balance-internal-group' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if request is in whitelist (skip loading indicator)
 */
export const isInWhiteList = (url?: string, pathname?: string): WhiteListItem | undefined => {
    return WHITE_LIST.find((item) => item.pathname === pathname && item.requestUrl === url)
}

/**
 * Normalize pathname by removing trailing slash
 */
export const normalizePathname = (pathname: string): string => {
    return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}
