export interface AdminTableType {
  id: string
  userName: string
  email: string
  phoneNumber: string
  status: string
  role: string
  active: boolean
}

export enum viewMode {
  'lock' = 'lock',
  'unlock' = 'unlock',
  'view' = 'view',
  'create' = 'create',
  'update' = 'update',
  'delete' = 'delete',
  'permission' = 'permission'
}

export interface AdminSearchParams {
  userName?: string
  email?: string
  phoneNumber?: string
  status?: string
  page?: number
  take?: number
  active?: boolean
  startDate?: string
  endDate?: string
  fullName?: string
  order?: string
  orderBy?: string
}

export interface AdminAccountPayload {
  data: AdminAccountData[]
  meta: Pagination
}

export interface AdminAccountData {
  id: string
  email: string
  fullName: string
  avatar: string
  phoneNumber: string
  permissionGroup: string
  active: number
  permissions: string[]
}

export interface Pagination {
  page: number
  take: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface MutationResponseType {
  data: MutationResponseDataType
}

export interface MutationResponseDataType {
  message: string
  statusCode: number
}
