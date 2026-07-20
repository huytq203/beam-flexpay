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
  ApiErrorResponse,
  RequestArgs,
  isInWhiteList,
  normalizePathname,
  callApi
} from './fetchBaseQuery.types'
import { updateAccessToken } from '@slices/authActions'
import { PATHS } from '@constants/pathConstant'
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
  prepareHeaders: (headers) => {
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
export const baseQueryWalletCore = fetchBaseQuery({
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

export const baseQueryMerchant = fetchBaseQuery({
  baseUrl: ENV.API_MERCHANT,
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

      // Cập nhật Redux store với access token mới và permissions
      api.dispatch(updateAccessToken({ token: newAccessToken, expiresIn: expiresInSeconds }))

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



// ============================================================================
// INACTIVITY TRACKING
// ============================================================================
let inactivityTimer: NodeJS.Timeout | null = null;

// SỬA LẠI: 15 phút chuẩn là 15 * 60 * 1000
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // Đổi lại 1 phút để test cho dễ, hoặc 15 * 60 * 1000 nếu prod
const RESET_THROTTLE = 2000; // 1 giây (để nhạy hơn khi tương tác)
const TIME_OLD = 'last_activity_time'; // Đổi tên biến cho rõ nghĩa hơn

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
    backdrop: `
      rgba(15, 23, 42, 0.4)
      backdrop-filter
      backdrop-blur-[4px]
    `,
    footer: '<span class="text-[10px] text-gray-500 font-medium">Dữ liệu chưa lưu có thể bị mất. Vui lòng kiểm tra lại sau khi đăng nhập.</span>',
    customClass: {
      popup: 'rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/60 !backdrop-blur-xl',
      title: 'text-[18px] font-bold text-slate-800 ',
      htmlContainer: 'text-[14px] text-slate-500',
      confirmButton: 'bg-blue-500 hover:bg-blue-300  text-white font-medium text-[14px] w-full py-2 rounded-xl shadow-lg transition-all duration-300 px-3',
      image: 'drop-shadow-xl mb-1 object-contain',
      footer: 'border-t-0 pt-0 pb-1 mx-auto text-center'
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

    resetInactivityTimer()

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
            handleSessionExpired()
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
export const fetchBaseQueryMerchant = createCustomBaseQuery(baseQueryMerchant)

