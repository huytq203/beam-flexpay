import {
  PaymentMethod,
  StatusType
} from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'

/** flex.merchant ghi mọi bút toán của merchant với `sourceDomain` này. */
export const MERCHANT_TRANSACTION_SOURCE_DOMAIN = 'MERCHANT'

/** Hai loại bút toán flex.merchant đang tạo: thu qua đơn hàng và rút tiền. */
export const MERCHANT_TRANSACTION_TYPE_OPTIONS = [
  { value: 'MERCHANT_PAYMENT', label: 'Thanh toán' },
  { value: 'MERCHANT_CASH_OUT', label: 'Rút tiền' }
]

export const MERCHANT_TRANSACTION_STATUS_OPTIONS = Object.entries(
  StatusType
).map(([value, label]) => ({ value, label }))

export const MERCHANT_TRANSACTION_METHOD_LABELS: Readonly<
  Record<string, string>
> = {
  ...PaymentMethod,
  BANK_TRANSFER: 'Chuyển khoản ngân hàng'
}
