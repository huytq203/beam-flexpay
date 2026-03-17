export interface FeePoliciesResponse {
  data: FeePoliciesData
  message: string
  detail: string
  success: boolean
  status: string
}

export interface FeePoliciesData {
  content: FeePoliciesContent[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  sort: Sort2
  numberOfElements: number
  empty: boolean
}

export interface FeePoliciesContent {
  id: string
  name: string
  serviceType: string
  description?: string
  feeDomain: string
  currency: string
  validFrom: string
  validTo: string
  status: string
  priority: number
  createdAt: string
  updatedAt: string
  createdBy: string
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
