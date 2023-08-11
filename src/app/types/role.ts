import { Pagination } from './table'

export interface IRoles {
  data: IRolesData[]
  meta: Pagination
}

export interface IRolesData {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  name: string
  displayName: string
}

export interface IRolesSearch {
  page: number
  take: number
  orderBy?: string
  query?: string
}
