export type PaymentMethodScope = 'MASTER' | 'SUB'

export type PaymentMethodCode = 'QR_DONG' | 'VI_DIEN_TU' | 'THE_NOI_DIA'

export type PaymentMethodChannel = 'WEB' | 'APP' | 'POS'

export type PaymentMethodStatus = 'ACTIVE' | 'INACTIVE'

export interface PaymentMethodRow {
  id: string
  scope: PaymentMethodScope
  merchantName: string
  merchantCode: string
  method: PaymentMethodCode
  channel: PaymentMethodChannel
  minAmount: number
  maxAmount: number
  feeLabel: string
  status: PaymentMethodStatus
  updatedAt: string
}

export interface PaymentMethodFilters {
  query: string
  method: 'ALL' | PaymentMethodCode
  status: 'ALL' | PaymentMethodStatus
}
