export interface RootFreeze {
  data: DataFreeze
  message: string
  detail: string
  success: boolean
  status: string
}

export interface DataFreeze {
  content: FreezeItem[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: Sort2
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface FreezeItem {
  id: string
  accountId: string
  ownerId: string
  ownerType: string
  ownerUsername: string
  amount: number
  reason?: string
  unfreezeReason: string | null
  status: string
  type: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
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
