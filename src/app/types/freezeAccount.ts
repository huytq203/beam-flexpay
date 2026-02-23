import { Dayjs } from 'dayjs'
import { IPageSearch } from './api'

export interface FreezeAccount {
  id: string
  ownerId: string
  ownerType: string
  ownerUsername: string
  glCode: string
  currency: string
  balance: number
  holdBalance: number
  availableBalance: number | null
  status: string
}

export interface FreezeItem {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  account: FreezeAccount
  idempotencyKey: string
  amount: number
  type: string
  reason: string
  status: string
  expiryTime: string | null
}

export interface FreezeParams {
  page?: number
  size?: number
  sort?: string
  status?: string
  type?: string
  [key: string]: unknown
}

export interface Pagination {
  page: number
  take: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface IFreezeAccountTable {
  id: number
  accountNumber: string
  freezeBalance: number
  reason: string
  freezeBy: string
  freezeAt: string
}

export interface IFreezeAccountTableSearch extends IPageSearch {
  id?: number
}

export interface IFreezeAccountForm {
  accountNumber: number
  accountName: string
  totalBalance: number
  avaiableBalance: number
  freezeBalance: number
  freezeBalanceRequest: number | string
  reason: string
}

export interface FreezeHistoryPayload {
  data: HistoryElementType[]
  meta: Pagination
}

export type HistoryElementType = {
  id: number
  createdAd: string
  updatedAt: string
  deletedAt: string
  reason: string
  freezeMoney: number | string
  customerId: number
  userId: number
  status: number
  user: UserElementType
  customer: CustomerElementType
}

type UserElementType = {
  id: number
  createdAd: string
  updatedAt: string
  deletedAt: string
  email: string
  fullName: string
  active: number
  phoneNumber: string
  avatar: string
}

export type CustomerElementType = {
  [key: string]: string | number
}

export interface FreezeAndUnfreezeAccountSearchParams {
  id?: string
  transactionId?: string
  customerAccountNumber?: string
  email?: string
  phoneNumber?: string
  status?: boolean
  page?: number
  take?: number
  orderBy?: string
  startDate?: Date
  endDate?: Date
}
