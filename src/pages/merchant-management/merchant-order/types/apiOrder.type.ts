export interface MerchantOrderResponse {
  data: MerchanOrder
  message: string
  detail: string
  success: boolean
  status: string
}

export interface MerchanOrder {
  content: MerchanOrderItem[]
  pageable: Pageable
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: Sort2
  numberOfElements: number
  first: boolean
  empty: boolean
}

export interface MerchanOrderItem {
  id: string
  merchantId: string
  transactionId: string
  orderCode: string
  orderDescription: string
  netAmount: number
  amount: number
  currency: string
  status: string
  bankCode: string
  expiredAt: any
  createdAt: string
  updatedAt: string
  virtualAccount: any
  qrCode: any
  qrCodeImage: any
  paymentRef: string
  paymentName: any
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: Sort
  offset: number
  paged: boolean
  unpaged: boolean
}

export interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface Sort2 {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}
