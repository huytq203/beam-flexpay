import { HOLD_RULE_ERROR_MESSAGE } from '../constants/holdRule.constants'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Rẽ nhánh theo `message` (tên mã lỗi), không theo `status` hay chuỗi `detail`.
 * Các lỗi nghiệp vụ như `MERCHANT_HOLD_RULE_INVALID` đã kèm `detail` cụ thể nên
 * hiển thị nguyên `detail`.
 */
export const getHoldRuleErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (!isRecord(error) || !isRecord(error.data)) return fallback
  const data = error.data
  const message = typeof data.message === 'string' ? data.message : ''
  if (message === 'VALIDATION_ERROR' && isRecord(data.data)) {
    const first = Object.values(data.data).find(
      (item) => typeof item === 'string'
    )
    if (typeof first === 'string') return first
  }
  const detail = typeof data.detail === 'string' ? data.detail.trim() : ''
  if (detail) return detail
  return HOLD_RULE_ERROR_MESSAGE[message] ?? fallback
}

/** Chỉ mã 409 khi chưa có quy tắc SYSTEM đã duyệt là trạng thái hợp lệ, không phải lỗi hệ thống. */
export const isHoldRuleUnavailable = (error: unknown): boolean =>
  isRecord(error) &&
  isRecord(error.data) &&
  error.data.message === 'MERCHANT_HOLD_RULE_UNAVAILABLE'
