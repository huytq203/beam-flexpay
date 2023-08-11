import { IPageSearch } from './api'
import { Pagination } from './table'

export interface INapasTokenResponse {
  data: INapasToken[]
  meta: Pagination
}

export interface INapasToken {
  id: number
  payerName: string | null
  payerDebit: string | null
  status: boolean
  createdAt: string | null
  bank: IBank
}

export interface INapasTokenParams extends IPageSearch {
  from?: string
  to?: string
  cardNumber?: string
  tradingName?: string
  status?: boolean | string
  orderBy?: string
}

export interface IBank {
  id: number
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
  name: string | null
  tradingName: string | null
  bankCode: null
  active: number
}
