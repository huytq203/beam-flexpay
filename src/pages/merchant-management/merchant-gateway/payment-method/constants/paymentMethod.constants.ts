import type { PaymentMethod } from '@/app/services/merchantGatewayApi'

export const methodOptions: { label: string; value: PaymentMethod }[] = [
  { label: 'QR', value: 'QR' },
  { label: 'Thẻ nội địa', value: 'DOMESTIC_CARD' },
  { label: 'Thẻ quốc tế', value: 'INTERNATIONAL_CARD' },
  { label: 'Ví liên kết', value: 'LINKED_WALLET' },
  { label: 'Tài khoản định danh', value: 'VIRTUAL_ACCOUNT' }
]
