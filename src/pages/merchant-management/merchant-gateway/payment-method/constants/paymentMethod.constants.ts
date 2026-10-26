import type { PaymentMethod } from '@/app/services/merchantGatewayApi'

export const methodOptions: { label: string; value: PaymentMethod }[] = [
  { label: 'QR', value: 'QR' },
  { label: 'Thẻ nội địa', value: 'DOMESTIC_CARD' },
  { label: 'Thẻ quốc tế', value: 'INTERNATIONAL_CARD' },
  { label: 'Ví liên kết', value: 'LINKED_WALLET' },
  { label: 'Tài khoản định danh', value: 'VIRTUAL_ACCOUNT' }
]

export const METHOD_DESCRIPTIONS: Record<PaymentMethod, string> = {
  QR: 'Thanh toán bằng mã QR',
  DOMESTIC_CARD: 'Thẻ ATM nội địa',
  INTERNATIONAL_CARD: 'Visa, Mastercard, JCB',
  LINKED_WALLET: 'Thanh toán qua ví liên kết',
  VIRTUAL_ACCOUNT: 'Nhận tiền qua tài khoản định danh'
}

/** Mặc định hệ thống bật cả 5 hình thức. */
export const SYSTEM_DEFAULT_METHODS: PaymentMethod[] = methodOptions.map(
  (item) => item.value
)
