import {
  ORDER_STATUS_FILTER_VALUES,
  type AnomalyFilterKey,
  type OrderFilterKey
} from '../constants/merchantOrder.constants'
import type {
  AnomalyFilters,
  MerchantOrderStatus,
  OrderFilters,
  PaymentAnomalyStatus
} from '../types/merchantOrder.types'

type Raw<K extends string> = Partial<Record<K, string>>

export const fromOrderUrlFilters = (
  raw: Raw<OrderFilterKey>
): OrderFilters => ({
  merchantCode: raw.merchantCode ?? '',
  merchantId: raw.merchantId,
  orderCode: raw.orderCode ?? '',
  // Giá trị lạ trên URL bị bỏ: BE trả 500 với enum không tồn tại.
  status: ORDER_STATUS_FILTER_VALUES.includes(raw.status as MerchantOrderStatus)
    ? (raw.status as MerchantOrderStatus)
    : undefined
})

export const toOrderUrlFilters = (
  filters: OrderFilters
): Record<OrderFilterKey, string | undefined> => ({
  merchantCode: filters.merchantCode.trim() || undefined,
  merchantId: filters.merchantId,
  orderCode: filters.orderCode.trim() || undefined,
  status: filters.status
})

export const fromAnomalyUrlFilters = (
  raw: Raw<AnomalyFilterKey>
): AnomalyFilters => ({
  status:
    raw.status === 'OPEN' || raw.status === 'RESOLVED'
      ? (raw.status as PaymentAnomalyStatus)
      : undefined
})
