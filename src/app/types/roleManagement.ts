export interface ResponseRole {
  data: DataRole
  message: string
  detail: string
  success: boolean
  status: string
}

export interface DataRole {
  totalElements: number
  totalPages: number
  size: number
  content: DataRoleItem[]
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
  sort: Sort
  pageable: Pageable
  empty: boolean
}

export interface DataRoleItem {
  id: string
  name: string
  description: string
  no?: number
}

export interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface Pageable {
  offset: number
  sort: Sort2
  paged: boolean
  pageNumber: number
  pageSize: number
  unpaged: boolean
}

export interface Sort2 {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}
