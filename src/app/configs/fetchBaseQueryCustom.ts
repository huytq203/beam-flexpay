import { ENV } from './env'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
  BaseQueryApi
} from '@reduxjs/toolkit/query'
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
  TokenData,
  ApiErrorResponse,
  RequestArgs,
  isInWhiteList,
  isAdminChangePasswordRequest,
  isPasswordResetRequest,
  suppressesErrorNotification,
  normalizePathname,
  setRefreshTokenCookie
} from './fetchBaseQuery.types'
import type { RootState } from '../store'
import { updateAccessToken } from '@slices/authActions'
import { PATHS } from '@constants/pathConstant'
import { AUTHENTICATION } from '@constants/routersConstant'
import Swal from 'sweetalert2'

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

/**
 * Gắn Authorization cho mọi base query.
 *
 * Đọc cookie trước, nếu cookie đã bay (hết hạn sớm hơn phiên) thì lấy token
 * đang giữ trong Redux. Thiếu bước fallback này request sẽ đi "trần" và server
 * trả 401 dù phiên vẫn còn refresh token dùng được.
 */
const prepareAuthHeaders = (
  headers: Headers,
  { getState }: Pick<BaseQueryApi, 'getState'>
): Headers => {
  const accessToken =
    Cookies.get(CookieKey.ACCESS_TOKEN) ?? (getState() as RootState).auth.accessToken

  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`)
  }
  return headers
}

const baseAuthQuery = fetchBaseQuery({
  baseUrl: ENV.API_LOGIN,
  credentials: 'include',
  prepareHeaders: prepareAuthHeaders
})

const baseQueryOld = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: prepareAuthHeaders
})


export const baseQueryFee = fetchBaseQuery({
  baseUrl: ENV.API_FEE,
  credentials: 'include',
  prepareHeaders: prepareAuthHeaders
})

export const baseQueryWalletCore = fetchBaseQuery({
  baseUrl: ENV.API_WALLETCORE,
  credentials: 'include',
  prepareHeaders: prepareAuthHeaders
})

export const baseQueryUserWallet = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_USER_WALLET,
  credentials: 'include',
  prepareHeaders: prepareAuthHeaders
})

export const baseQueryMerchant = fetchBaseQuery({
  baseUrl: ENV.API_MERCHANT,
  credentials: 'include',
  prepareHeaders: prepareAuthHeaders
})



// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * Refresh access token using refresh token stored in cookies
 * Uses singleton pattern to prevent multiple simultaneous refresh requests
 */



type AccessTokenDispatch = (
  action: ReturnType<typeof updateAccessToken>
) => unknown

const getRefreshData = (
  response: RefreshResponse | TokenData
): TokenData | null => {
  if ('data' in response) return response.data
  return 'accessToken' in response ? response : null
}

/**
 * Dùng chung cho cả bootstrap phiên trong AppLayout và retry request khi gặp
 * 401. Promise singleton đảm bảo nhiều request hết hạn cùng lúc chỉ refresh một
 * lần.
 */
export const refreshAccessToken = async (
  dispatch: AccessTokenDispatch
): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true

  refreshPromise = (async () => {
    try {
      const refreshToken = Cookies.get(CookieKey.REFRESH_TOKEN)
      if (!refreshToken) return null

      const refreshUrl = `${ENV.API_LOGIN.replace(/\/$/, '')}/auth/refresh`
      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        console.error(`[Auth] Refresh token failed with HTTP ${response.status}`)
        return null
      }

      const refreshResult = (await response.json()) as RefreshResponse | TokenData
      const data = getRefreshData(refreshResult)
      const newAccessToken = data?.[TokenType.ACCESS_TOKEN]

      if (!newAccessToken) return null

      // Sử dụng expiresIn từ API (đơn vị giây), fallback 300 giây
      const expiresInSeconds = data?.[TokenType.EXPIRES_IN] || CookieExpiry.ACCESS_TOKEN_SECONDS
      // Sử dụng refreshExpiresIn từ API (đơn vị giây), fallback 1800 giây
      const refreshExpiresInSeconds = data?.[TokenType.REFRESH_EXPIRES_IN] || CookieExpiry.REFRESH_TOKEN_SECONDS

      // Cập nhật Redux store với access token mới và permissions
      dispatch(updateAccessToken({
        token: newAccessToken,
        expiresIn: expiresInSeconds,
        refreshExpiresIn: refreshExpiresInSeconds
      }))

      if (data?.[TokenType.REFRESH_TOKEN]) {
        setRefreshTokenCookie(
          data[TokenType.REFRESH_TOKEN],
          refreshExpiresInSeconds
        )
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



// ============================================================================
// INACTIVITY TRACKING
// ============================================================================
let inactivityTimer: NodeJS.Timeout | null = null;

const IS_INACTIVITY_TRACKING_ENABLED = import.meta.env.PROD;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const RESET_THROTTLE = 2000;
const TIME_OLD = 'last_activity_time';

let lastResetTime = 0;
let isExpired = false;


const forceLogout = (): void => {
  Cookies.remove(CookieKey.ACCESS_TOKEN)
  Cookies.remove(CookieKey.REFRESH_TOKEN)
  window.location.href = PATHS.AUTH.LOGIN
  localStorage.removeItem(TIME_OLD);
}

const handleSessionExpired = () => {
  if (isExpired) return;

  // Trong khu vực auth (đăng nhập, quên mật khẩu, đặt lại mật khẩu) chưa có phiên
  // nào để hết hạn. 401 ở đây là lỗi nghiệp vụ của chính màn đó — ví dụ token đặt
  // lại mật khẩu đã hết hạn — nên để màn tự hiển thị, đừng chèn modal hết phiên.
  if (normalizePathname(window.location.pathname).startsWith(AUTHENTICATION)) return;

  isExpired = true;


  Swal.fire({
    title: 'Phiên đăng nhập hết hạn',
    text: 'Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.',
    //  imageUrl: capybaraIcon,
    // imageWidth: 150,
    // imageHeight: 150,
    // imageAlt: 'Capybara',
    icon: 'warning',
    iconColor: '#F59E0B',
    
    showCancelButton: false,
    confirmButtonText: 'Đăng nhập lại',
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    width: 360,
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.95)',
    backdrop: 'rgba(15, 23, 42, 0.4)',
    footer: '<span class="session-expired-footer-text">Dữ liệu chưa lưu có thể bị mất. Vui lòng kiểm tra lại sau khi đăng nhập.</span>',
    customClass: {
      container: 'session-expired-container',
      popup: 'session-expired-popup',
      title: 'session-expired-title',
      htmlContainer: 'session-expired-message',
      confirmButton: 'session-expired-confirm',
      image: 'session-expired-image',
      footer: 'session-expired-footer'
    },
    buttonsStyling: false
  }).then((result) => {
    // Tùy chọn: Chuyển hướng hoặc reload nếu forceLogout chưa làm
    if (result.isConfirmed) {
      localStorage.removeItem(TIME_OLD);
      forceLogout();
    }
  });
};


export const resetInactivityTimer = (isFromEvent = false, isInitial = false) => {
  if (!IS_INACTIVITY_TRACKING_ENABLED) return;
  if (isExpired) return; // Nếu đã out thì không rải event nữa

  const currentTime = Date.now();

  const pathName = normalizePathname(window.location.pathname);
  if (pathName === PATHS.AUTH.LOGIN) {
    localStorage.removeItem(TIME_OLD);
    return;
  }

  if (isFromEvent && currentTime - lastResetTime < RESET_THROTTLE) {
    return;
  }
  lastResetTime = currentTime;

  const lastActivity = Number(localStorage.getItem(TIME_OLD) || 0);

  if (lastActivity && currentTime - lastActivity > INACTIVITY_TIMEOUT) {
    if (isInitial) {
      forceLogout();
    } else {
      handleSessionExpired();
    }
    return;
  }

  localStorage.setItem(TIME_OLD, currentTime.toString());

  if (inactivityTimer) clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    const latestActivity = Number(localStorage.getItem(TIME_OLD) || 0);

    if (Date.now() - latestActivity >= INACTIVITY_TIMEOUT) {
      handleSessionExpired();
    } else {
      resetInactivityTimer();
    }
  }, INACTIVITY_TIMEOUT);
};

export const initInactivityTracker = () => {
  if (typeof window === 'undefined') return;

  if (!IS_INACTIVITY_TRACKING_ENABLED) {
    localStorage.removeItem(TIME_OLD);
    return;
  }

  const interactions = ['mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];
  interactions.forEach((event) => {
    window.addEventListener(event, () => resetInactivityTimer(true), { capture: true, passive: true });
  });

  window.addEventListener('storage', (event) => {
    if (event.key === TIME_OLD && !event.newValue) {
      handleSessionExpired();
    }
  });

  resetInactivityTimer(false, true);
};

// ============================================================================
// FACTORY FUNCTION - Create custom base query with loading & error handling
// ============================================================================

export interface CustomBaseQueryExtraOptions {
  /** Dùng cho thao tác đã có loading cục bộ, không đưa cờ UI vào query string. */
  suppressGlobalLoading?: boolean
  /**
   * Màn tự báo lỗi trong `catch` → tắt notification tập trung để tránh 2 toast.
   * Luồng refresh token 401 vẫn giữ nguyên.
   */
  suppressErrorNotification?: boolean
}

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
): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  CustomBaseQueryExtraOptions
> => {
  return async (args, api, extraOptions) => {
    const pathName = normalizePathname(window.location.pathname)

    resetInactivityTimer()

    const requestArgs = args as RequestArgs
    const isLoading = requestArgs?.params?.isLoading
    const requestUrl = typeof args === 'string' ? args : requestArgs?.url
    const handlesErrorLocally = isPasswordResetRequest(requestUrl)
    const isChangePasswordRequest = isAdminChangePasswordRequest(requestUrl)
    // Tắt notification tập trung nhưng vẫn giữ luồng refresh token 401.
    const hidesErrorNotification =
      Boolean(extraOptions?.suppressErrorNotification) ||
      isChangePasswordRequest ||
      suppressesErrorNotification(requestUrl)

    const shouldShowLoading =
      !extraOptions?.suppressGlobalLoading &&
      isLoading !== false &&
      !handlesErrorLocally &&
      !isChangePasswordRequest &&
      !isInWhiteList(requestUrl, pathName)

    if (shouldShowLoading) {
      showLoading()
    }

    const result = await baseQuery(args, api, extraOptions)
    if (shouldShowLoading) hideLoading()

    if (result.error && result.error.status && !handlesErrorLocally) {
      const status = result.error.status

      switch (status) {
        case HttpStatus.UNAUTHORIZED: {
          const newAccessToken = await refreshAccessToken(api.dispatch)
          if (!newAccessToken) {
            handleSessionExpired()
            break
          }

          // Refresh thành công → retry request 1 lần với token mới.
          const retryResult = await baseQuery(args, api, extraOptions)
          // Vẫn 401 dù token mới → phiên thật sự không dùng được, buộc hết phiên.
          if (retryResult.error?.status === HttpStatus.UNAUTHORIZED) {
            handleSessionExpired()
          }
          return retryResult
        }

        case HttpStatus.BAD_REQUEST: {
          const errorData = result.error.data as ApiErrorResponse
          if (errorData?.message && !hidesErrorNotification) {
            openNotification(errorData.message)
          }
          break
        }

        case FETCH_ERROR:
          break

        default: {
          const errorData = result.error.data as ApiErrorResponse
          if (errorData?.message && !hidesErrorNotification) {
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
export const fetchBaseQueryUserWallet = createCustomBaseQuery(baseQueryUserWallet)
export const fetchBaseQueryMerchant = createCustomBaseQuery(baseQueryMerchant)
