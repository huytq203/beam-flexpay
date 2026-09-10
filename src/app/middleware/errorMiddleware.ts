import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit'
import { logout } from '@slices/authSlice'
import { globalMessage } from '@hooks/useMessage'
import Cookies from 'js-cookie'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { PATHS } from '@constants/pathConstant'

/**
 * Error messages mapping by HTTP status code
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Yêu cầu không hợp lệ',
  401: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
  403: 'Bạn không có quyền thực hiện thao tác này',
  404: 'Không tìm thấy dữ liệu',
  409: 'Dữ liệu đã tồn tại',
  422: 'Dữ liệu không hợp lệ',
  500: 'Lỗi hệ thống, vui lòng thử lại sau',
  502: 'Máy chủ không phản hồi',
  503: 'Dịch vụ tạm thời không khả dụng'
}

/**
 * Endpoints that should not show error messages
 * Add endpoint names here to suppress error notifications
 */
const SILENT_ENDPOINTS: string[] = [
  'adminChangePassword',
  'adminForgotPassword',
  'validateAdminResetToken',
  'resetAdminPassword',
  // Màn Bảo mật tự dựng trạng thái lỗi ngay trong tab, không cần toast trùng.
  'getCustomerDevices',
  // Thời tiết panel đăng nhập chỉ là trang trí — lỗi của nó không được hiện
  // toast lên màn hình người dùng đang đăng nhập.
  'getCurrentWeather'
]

/** Các API tự hiển thị lỗi 403 ngay trong luồng auth, không phải lỗi phân quyền. */
const LOCAL_403_ENDPOINTS = new Set([
  'userLogin',
  'adminForgotPassword',
  'validateAdminResetToken',
  'resetAdminPassword',
  'verifyLoginOtp',
  'verifyResetPasswordOtp',
  'resendAdminOtp',
  'getCurrentWeather'
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** Đọc một field kiểu string từ object không rõ kiểu. */
const readString = (
  source: Record<string, unknown> | undefined,
  key: string
): string | undefined => {
  const value = source?.[key]
  return typeof value === 'string' && value ? value : undefined
}

/** Lấy status code (number) từ payload lỗi không rõ kiểu. */
const readStatus = (error: unknown): number | undefined => {
  if (!isRecord(error)) return undefined
  const status = error.status
  return typeof status === 'number' ? status : undefined
}

/**
 * Extract error message from API response
 */
const getErrorMessage = (error: unknown): string => {
  const data = isRecord(error) && isRecord(error.data) ? error.data : undefined
  const status = readStatus(error)

  // Priority: detail -> message -> status code message -> default
  return (
    readString(data, 'detail') ||
    readString(data, 'message') ||
    readString(data, 'error') ||
    (status !== undefined ? ERROR_MESSAGES[status] : undefined) ||
    'Có lỗi xảy ra, vui lòng thử lại'
  )
}

/** Điều hướng SPA tới màn 403 mà không tải lại toàn bộ ứng dụng. */
export const redirectToForbidden = (endpointName?: string): void => {
  if (window.location.pathname === PATHS.FORBIDDEN) return

  const currentState = isRecord(window.history.state)
    ? window.history.state
    : {}
  const routerState = isRecord(currentState.usr) ? currentState.usr : {}
  window.history.replaceState(
    {
      ...currentState,
      usr: {
        ...routerState,
        forbiddenFrom: window.location.pathname,
        forbiddenEndpoint: endpointName
      }
    },
    '',
    PATHS.FORBIDDEN
  )
  window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }))
}

const redirectToLogin = (): void => {
  if (window.location.pathname === PATHS.AUTH.LOGIN) return
  window.history.replaceState(window.history.state, '', PATHS.AUTH.LOGIN)
  window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }))
}

/**
 * RTK Query Error Middleware
 * Handles all rejected API calls and shows appropriate error messages
 */
export const errorMiddleware: Middleware = (storeApi) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error: unknown = action.payload
    // action.meta.arg là `{}` ở kiểu của RTK; thu hẹp thay vì ép kiểu.
    const meta: unknown = action.meta
    const arg = isRecord(meta) ? meta.arg : undefined
    const endpointName =
      isRecord(arg) && typeof arg.endpointName === 'string'
        ? arg.endpointName
        : undefined

    const statusCode = readStatus(error)
    const errorMessage = getErrorMessage(error)

    if (
      statusCode === 403 &&
      (!endpointName || !LOCAL_403_ENDPOINTS.has(endpointName))
    ) {
      const hasSession = Boolean(
        Cookies.get(CookieKey.ACCESS_TOKEN) || Cookies.get(CookieKey.REFRESH_TOKEN)
      )
      if (hasSession) {
        redirectToForbidden(endpointName)
      } else {
        storeApi.dispatch(logout())
        redirectToLogin()
      }
      return next(action)
    }

    // Endpoint tự trình bày lỗi trong UI; chỉ bỏ toast, không làm đổi policy 403.
    if (endpointName && SILENT_ENDPOINTS.includes(endpointName)) {
      return next(action)
    }

    // Handle specific status codes
    switch (statusCode) {
      case 401: {
        const accessToken = Cookies.get(CookieKey.ACCESS_TOKEN)
        const refreshToken = Cookies.get(CookieKey.REFRESH_TOKEN)

        if (!accessToken && !refreshToken) {
          globalMessage.error(errorMessage)
          storeApi.dispatch(logout())
          window.location.href = PATHS.AUTH.LOGIN
        }
        break
      }

      case 404:
        // Only show 404 for non-GET requests or important resources
        globalMessage.warning(errorMessage)
        break

      case 500:
      case 502:
      case 503:
        globalMessage.error(errorMessage)
        break

      default:
        if (errorMessage) {
          globalMessage.error(errorMessage)
        }
    }

    // Log error for debugging (can be sent to monitoring service)
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]:', {
        endpoint: endpointName,
        status: statusCode,
        message: errorMessage,
        payload: error
      })
    }
  }

  return next(action)
}
