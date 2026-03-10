import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit'
import { logout } from '@slices/authSlice'
import { globalMessage } from '@hooks/useMessage'
import Cookies from 'js-cookie'
import { CookieKey } from '@configs/fetchBaseQuery.types'

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
  // 'checkHealth',
  // 'getStatus'
]

/**
 * Extract error message from API response
 */
const getErrorMessage = (error: any): string => {
  // Priority: detail -> message -> status code message -> default
  return (
    error?.data?.detail ||
    error?.data?.message ||
    error?.data?.error ||
    ERROR_MESSAGES[error?.status] ||
    'Có lỗi xảy ra, vui lòng thử lại'
  )
}

/**
 * RTK Query Error Middleware
 * Handles all rejected API calls and shows appropriate error messages
 */
export const errorMiddleware: Middleware = (storeApi) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload as any
    const endpointName = action.meta?.arg?.endpointName

    // Skip silent endpoints
    if (endpointName && SILENT_ENDPOINTS.includes(endpointName)) {
      return next(action)
    }

    const statusCode = error?.status
    const errorMessage = getErrorMessage(error)

    // Handle specific status codes
    switch (statusCode) {
      case 401: {
        const accessToken = Cookies.get(CookieKey.ACCESS_TOKEN)
        const refreshToken = Cookies.get(CookieKey.REFRESH_TOKEN)

        if (!accessToken && !refreshToken) {
          globalMessage.error(errorMessage)
          storeApi.dispatch(logout())
          window.location.href = '/auth/login'
        }
        break
      }

      case 403:
        globalMessage.error(errorMessage)
        break

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
