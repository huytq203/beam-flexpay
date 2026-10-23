import type {
  MerchantOrderStatus,
  OrderBankCode,
  OrderPaymentMethod,
  PaymentAnomalyReason,
  PaymentAnomalyStatus
} from '@/app/services/apiOrderMerchant.api'

export type {
  MerchantOrder,
  MerchantOrderStatus,
  MerchantPaymentAnomaly,
  OrderBankCode,
  OrderPaymentMethod
} from '@/app/services/apiOrderMerchant.api'

export type OrderTab = 'orders' | 'anomalies'

export interface OrderFilters {
  merchantCode: string
  merchantId?: string
  orderCode: string
  status?: MerchantOrderStatus
}

export interface AnomalyFilters {
  status?: PaymentAnomalyStatus
}

export type { PaymentAnomalyReason, PaymentAnomalyStatus }

/** Hành động ghi trên một đơn; mỗi hành động mở một hộp thoại riêng. */
export type OrderActionKind = 'confirm' | 'retry' | 'refresh' | 'cancel'

export interface OrderActionTarget {
  kind: OrderActionKind
  orderId: string
}

export interface OrderCreateForm {
  merchantId?: string
  subMerchantId?: string
  terminalId: string
  orderCode: string
  orderDescription: string
  purpose: string
  amount: number | null
  bankCode: OrderBankCode
  paymentMethod: OrderPaymentMethod
  expiredAt: string
}
