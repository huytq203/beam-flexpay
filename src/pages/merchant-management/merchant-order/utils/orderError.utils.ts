import { getApiErrorDetail } from '@/app/utils/api-error'
import { PAYMENT_METHOD_LABELS } from '../constants/merchantOrder.constants'
import type { OrderPaymentMethod } from '../types/merchantOrder.types'

interface ErrorBody {
  message?: unknown
  status?: unknown
  detail?: unknown
  data?: unknown
}

const readBody = (error: unknown): ErrorBody => {
  if (!error || typeof error !== 'object' || !('data' in error)) return {}
  const { data } = error
  return data && typeof data === 'object' ? (data as ErrorBody) : {}
}

/** Mã lỗi nghiệp vụ: rẽ nhánh theo `message`, không theo câu `detail`. */
export const getOrderErrorCode = (error: unknown): string | undefined => {
  const { message } = readBody(error)
  return typeof message === 'string' ? message : undefined
}

const validationDetail = (data: unknown): string => {
  if (!data || typeof data !== 'object') return ''
  return Object.values(data as Record<string, unknown>)
    .filter((item): item is string => typeof item === 'string')
    .join('; ')
}

/**
 * Câu lỗi hiển thị. 5514 có `detail` chỉ là tên enum (ví dụ `QR`) nên đổi sang
 * câu tiếng Việt; lỗi validate gộp thông báo từng trường; 500 do sai kiểu tham
 * số không có `detail` hữu ích nên dùng câu dự phòng.
 */
export const describeOrderError = (
  error: unknown,
  fallback: string
): string => {
  const code = getOrderErrorCode(error)
  const body = readBody(error)
  if (code === 'MERCHANT_PAYMENT_METHOD_NOT_ACCEPTED') {
    const method = typeof body.detail === 'string' ? body.detail : ''
    const label =
      PAYMENT_METHOD_LABELS[method as OrderPaymentMethod] ?? (method || '—')
    return `Hình thức thanh toán "${label}" chưa được bật cho phạm vi (Merchant, Sub-merchant, terminal) của đơn này.`
  }
  if (code === 'VALIDATION_ERROR') {
    const fields = validationDetail(body.data)
    const detail = getApiErrorDetail(error, fallback)
    return fields ? `${detail}: ${fields}` : detail
  }
  if (code === 'INTERNAL_SERVER_ERROR') return fallback
  return getApiErrorDetail(error, fallback)
}

/**
 * Tạo đơn/làm mới QR lỗi 4310 không nghĩa là chưa có đơn: đơn có thể đã ở
 * ACTIVE (không rollback), cần tra lại thay vì tạo lại bằng mã mới.
 */
export const isOrderCreateFailed = (error: unknown): boolean =>
  getOrderErrorCode(error) === 'ORDER_CREATE_FAILED'
