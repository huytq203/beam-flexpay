export interface ResponePermission {
  data: Permission
  message: string
  detail: string
  success: boolean
  status: string
}

export interface Permission {
  content: PermissionItem[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  numberOfElements: number
  sort: Sort2
  empty: boolean
}

export interface PermissionItem {
  id: string
  name: string
  description: string | null
  no?: number
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
