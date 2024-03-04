import { Pagination } from './table'

export interface InternalWalletPayload {
  order?: string
  page: number
  take: number
  query?: string
  orderBy?: string
}

export interface InternalWalletTransactionPayload {
  order?: string
  page: number
  take: number
  query?: string
  orderBy?: string
  internalWalletId?: number
  startDate: string
  endDate: string
}

export interface InternalWallet {
  id: number
  name: string
  walletNumber: string
  availableMoney: number
  active: boolean
  balanceInternalGroup: InternalWalletGroup
  createdAt: string
}

export interface InternalWalletGroup {
  id: number
  name: string
  active: boolean
  walletGroup: number
}

export interface InternalWalletResponse {
  data: InternalWallet[]
  meta: Pagination
  statusCode: number
  message: string
}

export interface ModifyInternalWalletBody {
  balanceInternalGroupId?: number
  name?: string
  walletNumber?: string
  active?: number
}