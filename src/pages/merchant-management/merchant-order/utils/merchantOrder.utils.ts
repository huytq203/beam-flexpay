import type { MerchantOrder } from '../types/merchantOrder.types'
import { RETRY_CREDIT_STATUSES } from '../constants/merchantOrder.constants'

export const formatOrderMoney = (value?: number | null): string =>
  value === null || value === undefined
    ? '—'
    : `${new Intl.NumberFormat('vi-VN').format(value)} ₫`

/** `YYYY-MM-DDTHH:mm:ss` giờ Việt Nam (không múi giờ) hoặc ISO có `Z`. */
export const formatOrderDateTime = (value?: string | null): string => {
  if (!value) return '—'
  const date = new Date(parseOrderTime(value))
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(date)
}

/** BE trả giờ Việt Nam không múi giờ; gắn +07:00 để không lệch theo máy người dùng. */
export const parseOrderTime = (value: string): number => {
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value)
  return Date.parse(hasZone ? value : `${value}+07:00`)
}

export const isOrderExpired = (
  order: Pick<MerchantOrder, 'expiredAt'>,
  now: number = Date.now()
): boolean => {
  if (!order.expiredAt) return false
  const expiredAt = parseOrderTime(order.expiredAt)
  return !Number.isNaN(expiredAt) && expiredAt < now
}

/** `confirm` chỉ mời gọi ở đơn còn chờ và còn hạn; các ca khác BE trả 409. */
export const canConfirmOrder = (order: MerchantOrder): boolean =>
  order.status === 'ACTIVE' && !isOrderExpired(order)

export const canRefreshOrderQr = (order: MerchantOrder): boolean =>
  order.status === 'ACTIVE' && !isOrderExpired(order)

/** Hủy được cả khi đã quá hạn mà job nền chưa đóng đơn. */
export const canCancelOrder = (order: MerchantOrder): boolean =>
  order.status === 'ACTIVE'

export const canRetryCredit = (order: MerchantOrder): boolean =>
  RETRY_CREDIT_STATUSES.includes(order.status)

/** Phí chỉ là số cuối cùng khi đơn đã SUCCESS; trước đó là ước tính. */
export const isFeeFinal = (order: MerchantOrder): boolean =>
  order.status === 'SUCCESS'

export const shortId = (id: string): string => id.slice(0, 8)

/** Số nguyên dương trong giới hạn an toàn; BE ném 500 với số thập phân. */
export const isWholeMoney = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 1

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (value: string): boolean => UUID_PATTERN.test(value)
