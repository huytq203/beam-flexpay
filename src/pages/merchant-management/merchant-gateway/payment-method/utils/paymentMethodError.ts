import type { PaymentMethodCapability } from '@/app/services/merchantPaymentMethodApi'
import { getApiErrorDetail } from '@/app/utils/api-error'

/** Câu tiếng Việt cho các `reasonCode` BE trả nguyên văn trong `detail` của lỗi 5506. */
const INELIGIBLE_REASONS: Record<string, string> = {
  INTERNATIONAL_CARD_CONTRACT_REQUIRED: 'ĐVCNTT chưa có hợp đồng thẻ quốc tế'
}

/** Tên ErrorCode của BE (`message`); dùng để rẽ nhánh thay cho `status`. */
export const getApiErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object' || !('data' in error)) return
  const data = error.data
  if (!data || typeof data !== 'object' || !('message' in data)) return
  return typeof data.message === 'string' ? data.message : undefined
}

export const isVersionConflict = (error: unknown) =>
  getApiErrorCode(error) === 'MERCHANT_PAYMENT_METHOD_VERSION_CONFLICT'

/** Thông báo lỗi khi lưu cấu hình; lỗi 5506 có `detail` là mã tiếng Anh nên phải dịch. */
export const paymentMethodErrorMessage = (
  error: unknown,
  fallback: string,
  capabilities: PaymentMethodCapability[] = []
): string => {
  if (getApiErrorCode(error) !== 'MERCHANT_PAYMENT_METHOD_INELIGIBLE')
    return getApiErrorDetail(error, fallback)
  const code = getApiErrorDetail(error, '')
  const reason =
    capabilities.find((item) => item.reasonCode === code)?.reason ??
    INELIGIBLE_REASONS[code] ??
    'Merchant chưa đủ điều kiện'
  return `Không thể bật hình thức thanh toán: ${reason}`
}
