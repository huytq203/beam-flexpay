import type { PaymentMethodRow } from '../types/paymentMethod.type'

export const PAYMENT_METHOD_FIXTURE: readonly PaymentMethodRow[] = [
  {
    id: 'payment-highlands-wallet',
    scope: 'MASTER',
    merchantName: 'Highlands Coffee',
    merchantCode: 'MC000142',
    method: 'VI_DIEN_TU',
    channel: 'WEB',
    minAmount: 10000,
    maxAmount: 50000000,
    feeLabel: '0,8% / giao dịch',
    status: 'ACTIVE',
    updatedAt: '21/09/2026 09:30'
  },
  {
    id: 'payment-highlands-qr',
    scope: 'MASTER',
    merchantName: 'Highlands Coffee',
    merchantCode: 'MC000142',
    method: 'QR_DONG',
    channel: 'APP',
    minAmount: 5000,
    maxAmount: 30000000,
    feeLabel: '0,6% / giao dịch',
    status: 'ACTIVE',
    updatedAt: '20/09/2026 16:45'
  },
  {
    id: 'payment-gs25-card',
    scope: 'MASTER',
    merchantName: 'GS25 Việt Nam',
    merchantCode: 'MC000217',
    method: 'THE_NOI_DIA',
    channel: 'POS',
    minAmount: 10000,
    maxAmount: 20000000,
    feeLabel: '1,0% / giao dịch',
    status: 'INACTIVE',
    updatedAt: '18/09/2026 11:20'
  },
  {
    id: 'payment-sub-highlands-qr',
    scope: 'SUB',
    merchantName: 'HLC Nguyễn Huệ',
    merchantCode: 'SUB-0142-01',
    method: 'QR_DONG',
    channel: 'WEB',
    minAmount: 5000,
    maxAmount: 10000000,
    feeLabel: '0,7% / giao dịch',
    status: 'ACTIVE',
    updatedAt: '17/09/2026 14:10'
  }
]
