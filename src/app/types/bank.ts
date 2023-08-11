import { Pagination } from './table'

export interface IBankQuery {
  page: number
  limit?: number
  take?: number
  name?: string
  active?: string
  orderBy: string
  typeBank?: string
  isLoading?: boolean
  key?: string
}

export interface BankInformation {
  bankId: string
  address: string
  website: string
  logo: string
  createdTime: string
  status: boolean
  order: number
  name: string | null
  tradingName: string | null
  active: 0
  image: string | null
  shortLogo: string | null
  priority: number | null
  id: number | null
  createdAt: string | null
  updatedAt: string | null
  bankCode: string | null
  deletedAt: null
  no?: string | number
}

export interface PublicBankInterface {
  bankCode: string
  id: number
  image: null
  name: string
  tradingName: string
}

export interface BankConfig {
  bankName: string
  order: number
  bankCode: string
  status: string
}

export interface BankResponse {
  data: BankInformation[]
  meta: Pagination
}

export enum TYPE_BANK {
  DEPOSIT_BANK = 'DEPOSIT_BANK',
  WITHDRAWAL_BANK = 'WITHDRAWAL_BANK'
}

export enum BANK_CHANNEL {
  DIRECT = 'DIRECT',
  NAPAS = 'NAPAS',
  IBFT = 'IBFT',
  NONE = 'NONE'
}
