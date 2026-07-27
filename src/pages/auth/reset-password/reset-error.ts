import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

/** Lỗi RTK Query trả về từ `.unwrap()`. */
export type ResetMutationError = FetchBaseQueryError | SerializedError

export const FALLBACK_SUBMIT_ERROR = 'Không đặt lại được mật khẩu. Vui lòng thử lại.'
export const NETWORK_SUBMIT_ERROR =
  'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'

/** Các mã HTTP nghĩa là liên kết đặt lại đã mất hiệu lực. */
const EXPIRED_LINK_STATUSES = [401, 403, 410]

const isFetchError = (error: ResetMutationError): error is FetchBaseQueryError =>
  'status' in error

/** Lỗi mạng / timeout khác hẳn lỗi token: chưa kết luận được gì về liên kết. */
export const isNetworkError = (error: ResetMutationError): boolean =>
  isFetchError(error) &&
  (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR')

export const isExpiredLinkError = (error: ResetMutationError): boolean =>
  isFetchError(error) &&
  typeof error.status === 'number' &&
  EXPIRED_LINK_STATUSES.includes(error.status)

/** Body lỗi chuẩn của BE: `{ message: string | string[] }`. */
const readApiMessage = (body: unknown): string | null => {
  if (typeof body !== 'object' || body === null || !('message' in body)) return null
  const { message } = body as { message: unknown }
  if (typeof message === 'string' && message.trim().length > 0) return message
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0]
  return null
}

/** Câu hiển thị cho người dùng — không bao giờ lộ raw error. */
export const toSubmitErrorMessage = (error: ResetMutationError): string => {
  if (isNetworkError(error)) return NETWORK_SUBMIT_ERROR
  if (!isFetchError(error)) return FALLBACK_SUBMIT_ERROR
  return readApiMessage(error.data) ?? FALLBACK_SUBMIT_ERROR
}
