import {
  MATRIX_DETAIL_PREFERRED,
  MATRIX_ERROR_MESSAGE
} from '../constants/rolePermissionMatrixErrors.constants'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Chọn câu tiếng Việt theo `message` (tên mã lỗi). `detail` chỉ dùng khi là câu
 * nghiệp vụ cụ thể hoặc khi `message` chưa có trong bảng.
 */
export const getMatrixErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (!isRecord(error) || !isRecord(error.data)) return fallback
  const data = error.data
  const message = typeof data.message === 'string' ? data.message : ''
  const detail = typeof data.detail === 'string' ? data.detail.trim() : ''
  if (message === 'VALIDATION_ERROR' && isRecord(data.data)) {
    const first = Object.values(data.data).find(
      (item) => typeof item === 'string'
    )
    if (typeof first === 'string') return first
  }
  if (detail && MATRIX_DETAIL_PREFERRED.has(message)) return detail
  return MATRIX_ERROR_MESSAGE[message] ?? (detail || fallback)
}
