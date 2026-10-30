import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export type ResetMutationError = FetchBaseQueryError | SerializedError

interface ApiErrorBody {
  detail?: unknown
  message?: unknown
  status?: unknown
}

const RESET_TOKEN_ERROR_CODES = new Set(['23015', '23016', '23017'])
// 25001 CAPTCHA_INVALID, 25002 CAPTCHA_MISSING
const CAPTCHA_ERROR_CODES = new Set(['25001', '25002'])
const LEGACY_EXPIRED_HTTP_STATUSES = new Set([401, 403, 410])

export const FALLBACK_SUBMIT_ERROR =
  'Không đặt lại được mật khẩu. Vui lòng thử lại.'
export const NETWORK_SUBMIT_ERROR =
  'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'
export const DEFAULT_INVALID_LINK_MESSAGE =
  'Liên kết không hợp lệ, đã hết hạn hoặc đã được sử dụng.'
export const RATE_LIMIT_ERROR =
  'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.'
export const CAPTCHA_SUBMIT_ERROR =
  'Không xác thực được Captcha. Vui lòng tải lại trang rồi thử lại.'

const isFetchError = (
  error: ResetMutationError
): error is FetchBaseQueryError => 'status' in error

const readApiBody = (error: ResetMutationError): ApiErrorBody | null => {
  if (!isFetchError(error) || typeof error.data !== 'object' || !error.data) {
    return null
  }
  return error.data as ApiErrorBody
}

export const getApiErrorCode = (
  error: ResetMutationError
): string | null => {
  const status = readApiBody(error)?.status
  return typeof status === 'string' ? status : null
}

const readApiMessage = (error: ResetMutationError): string | null => {
  const body = readApiBody(error)
  if (!body) return null

  if (typeof body.detail === 'string' && body.detail.trim()) {
    return body.detail
  }

  if (
    typeof body.message === 'string' &&
    body.message.trim() &&
    !/^[A-Z0-9_]+$/.test(body.message)
  ) {
    return body.message
  }

  return null
}

export const isNetworkError = (error: ResetMutationError): boolean =>
  isFetchError(error) &&
  (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR')

export const isServerUnavailableError = (
  error: ResetMutationError
): boolean =>
  isNetworkError(error) ||
  (isFetchError(error) &&
    typeof error.status === 'number' &&
    error.status >= 500)

export const isExpiredLinkError = (error: ResetMutationError): boolean => {
  const code = getApiErrorCode(error)
  if (code && RESET_TOKEN_ERROR_CODES.has(code)) return true

  return (
    isFetchError(error) &&
    typeof error.status === 'number' &&
    LEGACY_EXPIRED_HTTP_STATUSES.has(error.status)
  )
}

export const toInvalidLinkMessage = (
  error: ResetMutationError
): string => {
  switch (getApiErrorCode(error)) {
    case '23016':
      return 'Liên kết đặt lại mật khẩu đã hết hạn.'
    case '23017':
      return 'Liên kết đặt lại mật khẩu này đã được sử dụng.'
    case '23015':
      return 'Liên kết đặt lại mật khẩu không hợp lệ.'
    default:
      return DEFAULT_INVALID_LINK_MESSAGE
  }
}

export const toSubmitErrorMessage = (
  error: ResetMutationError
): string => {
  if (isNetworkError(error)) return NETWORK_SUBMIT_ERROR
  return readApiMessage(error) ?? FALLBACK_SUBMIT_ERROR
}

export const toForgotPasswordErrorMessage = (
  error: ResetMutationError
): string => {
  const code = getApiErrorCode(error)
  if (code === '23018') return RATE_LIMIT_ERROR
  if (code && CAPTCHA_ERROR_CODES.has(code)) return CAPTCHA_SUBMIT_ERROR
  if (isNetworkError(error)) return NETWORK_SUBMIT_ERROR
  return (
    readApiMessage(error) ??
    'Chưa thể gửi liên kết lúc này. Vui lòng thử lại sau ít phút.'
  )
}
