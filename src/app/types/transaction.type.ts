export interface TransactionResponse {
  data: PageResult<TransactionItem>
  message: string
  detail: string
  success: boolean
  status: string
}

export interface PageResult<T> {
  totalPages: number
  totalElements: number
  size: number
  content: T[]
  number: number
  pageable: Pageable
  numberOfElements: number
  sort: SortInfo
  first: boolean
  last: boolean
  empty: boolean
}

export interface TransactionItem {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  transactionCode: string
  ownerId: string
  type: string
  grossAmount: number
  netAmount: number
  amount: number
  feeCalculationId: string
  feeAmount: number
  currency: string
  status: string
  idempotencyKey: string
  description: string
  transactionTime: string
  processedAt: string
  checksum: string
  netProfit: number
}

export interface Pageable {
  offset: number
  unpaged: boolean
  pageNumber: number
  paged: boolean
  pageSize: number
  sort: SortInfo
}

export interface SortInfo {
  empty: boolean
  unsorted: boolean
  sorted: boolean
}

