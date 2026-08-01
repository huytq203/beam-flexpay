import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { NETWORK_SUBMIT_ERROR, toInvalidLinkMessage } from '../../password-reset-error'
import type { OtpErrorBody } from '@type/auth'

export type OtpMutationError = FetchBaseQueryError | SerializedError

export const OtpErrorKind = {
  INVALID: 'invalid',
  SESSION_EXPIRED: 'session-expired',
  FLOW_EXPIRED: 'flow-expired',
  LOCKED: 'locked',
  RESEND_COOLDOWN: 'resend-cooldown',
  MAX_RESEND: 'max-resend',
  VERIFY_IN_PROGRESS: 'verify-in-progress',
  NOTIFICATION_FAILED: 'notification-failed',
  RECIPIENT_UNAVAILABLE: 'recipient-unavailable',
  RESET_TOKEN_INVALID: 'reset-token-invalid',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
} as const

export type OtpErrorKind =
  (typeof OtpErrorKind)[keyof typeof OtpErrorKind]

export interface ParsedOtpError {
  kind: OtpErrorKind
  message: string
  retryAfter: number | null
}

const OTP_CODE_TO_KIND: Record<string, OtpErrorKind> = {
  '22101': OtpErrorKind.INVALID,
  '22105': OtpErrorKind.SESSION_EXPIRED,
  '22111': OtpErrorKind.FLOW_EXPIRED,
  '22112': OtpErrorKind.LOCKED,
  '22108': OtpErrorKind.RESEND_COOLDOWN,
  '22109': OtpErrorKind.MAX_RESEND,
  '22114': OtpErrorKind.VERIFY_IN_PROGRESS,
  '22107': OtpErrorKind.NOTIFICATION_FAILED,
  '22113': OtpErrorKind.RECIPIENT_UNAVAILABLE,
  '23015': OtpErrorKind.RESET_TOKEN_INVALID,
  '23016': OtpErrorKind.RESET_TOKEN_INVALID,
  '23017': OtpErrorKind.RESET_TOKEN_INVALID
}

const isFetchBaseQueryError = (
  error: unknown
): error is FetchBaseQueryError =>
  typeof error === 'object' && error !== null && 'status' in error

const isOtpErrorBody = (value: unknown): value is OtpErrorBody =>
  typeof value === 'object' && value !== null

const fallbackMessage = (kind: OtpErrorKind): string => {
  switch (kind) {
    case OtpErrorKind.INVALID:
      return 'Mã OTP không chính xác. Vui lòng thử lại.'
    case OtpErrorKind.SESSION_EXPIRED:
      return 'Mã OTP đã hết hạn. Hãy gửi một mã mới.'
    case OtpErrorKind.FLOW_EXPIRED:
      return 'Phiên xác thực đã hết hạn. Vui lòng thực hiện lại từ đầu.'
    case OtpErrorKind.LOCKED:
      return 'Tài khoản tạm khóa do nhập sai quá nhiều lần.'
    case OtpErrorKind.RESEND_COOLDOWN:
      return 'Bạn cần chờ trước khi gửi lại mã.'
    case OtpErrorKind.MAX_RESEND:
      return 'Bạn đã dùng hết số lần gửi lại mã.'
    case OtpErrorKind.NOTIFICATION_FAILED:
      return 'Không gửi được mã xác thực. Vui lòng thử lại.'
    case OtpErrorKind.RECIPIENT_UNAVAILABLE:
      return 'Tài khoản chưa có email đã xác thực. Vui lòng liên hệ quản trị hệ thống.'
    case OtpErrorKind.NETWORK:
      return NETWORK_SUBMIT_ERROR
    default:
      return 'Chưa thể xác thực mã lúc này. Vui lòng thử lại.'
  }
}

export const parseOtpError = (error: unknown): ParsedOtpError => {
  if (!isFetchBaseQueryError(error)) {
    return {
      kind: OtpErrorKind.UNKNOWN,
      message: fallbackMessage(OtpErrorKind.UNKNOWN),
      retryAfter: null
    }
  }

  if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
    return {
      kind: OtpErrorKind.NETWORK,
      message: fallbackMessage(OtpErrorKind.NETWORK),
      retryAfter: null
    }
  }

  const body = isOtpErrorBody(error.data) ? error.data : {}
  const kind = body.status
    ? (OTP_CODE_TO_KIND[body.status] ?? OtpErrorKind.UNKNOWN)
    : OtpErrorKind.UNKNOWN
  const message =
    typeof body.detail === 'string' && body.detail.trim()
      ? body.detail
      : kind === OtpErrorKind.RESET_TOKEN_INVALID
        ? toInvalidLinkMessage(error)
        : fallbackMessage(kind)

  return {
    kind,
    message,
    retryAfter:
      typeof body.retryAfter === 'number' && body.retryAfter > 0
        ? body.retryAfter
        : null
  }
}
