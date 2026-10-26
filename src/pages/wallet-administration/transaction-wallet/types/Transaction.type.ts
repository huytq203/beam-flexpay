export interface FormSearchValues {
  status: string
  fromDate: string
  toDate: string
  transactionType?: string
  /** Ô "Tài khoản": khớp ví ở MỘT TRONG HAI vai, nên ra cả giao dịch chuyển lẫn nhận. */
  partyUsername?: string
  bankCode?: string
  paymentMethod?: string
  transactionCode?: string
  minAmount?: number
  maxAmount?: number
  sourceDomain?: string
  /** `'true'` / `'false'` / rỗng (không lọc); đổi sang boolean khi gọi API. */
  hasRefund?: string
}

export interface TransactionFreezeTarget {
  accountId: string
  ownerId: string
  ownerName: string
  ownerType: string
  availableBalance: number
  currency: string
  roleLabel: 'Người chuyển' | 'Người nhận'
}
