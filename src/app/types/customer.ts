import { Pagination } from './table'

export interface CustomerSearchParams {
  email?: string
  phone?: string
  accountOwner?: string
  status?: string
  accountStatus?: string
  page?: number
  take?: number
  active?: boolean
  startDate?: string
  endDate?: string
  query?: string
  name?: string
}

export interface AccountPayload {
  data: CustomerTable[]
  meta: Pagination
}

export interface CustomerTable {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string
  type: string
  gender: number
  fullName: string
  birthDay: string
  avatar: string
  phoneNumber: string
  identityNumber: number
  dateOfIdentityIssuance: string
  placeOfIdentityIssuance: string
  address: string
  village: string
  district: string
  province: string
  email: string
  referralCode: string
  status: boolean
  active: boolean
  accountNumber: string
}

export interface CustomerInterface {
  key?: number
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: null | null
  type: null | string
  gender: number
  active: boolean
  fullName: string | null
  birthDay: string | null
  avatar: string | null
  phoneNumber: string
  identityNumber: string | null
  dateOfIdentityIssuance: string | null
  placeOfIdentityIssuance: null
  address: string | null
  village: string | null
  district: string | null
  province: string | null
  email: string | null
  referralCode: string | null
  status: string
  nationality: string | null
  career: string | null
  accountStatus: boolean | null
  security: string | null
  totalBalance: string | null
  position: string | null
  availableBalances: string | null
  lockedBalance: string | null
  accountNumber: string
  balances: any[]
}

export interface ResultListAccountInterface {
  data: CustomerInterface[]
  meta: Pagination
}

export interface ICustomerDetail {
  id: string
  name: string
  email: string
  phone: string
  gender: number
  idNumber: string
  status: string
  accountStatus: string
  dateOfBirth: string
  emailStatus: number
  dateOfIdNumber: string
  placeOfIdNumber: string
  address: string
  nationality: string
  district: string
  province: string
  career: string
  position: string
  validated: boolean
  security: string
  totalBalance: number
  availableBalances: number
  lockedBalance: number
  accountType: string
}

export enum viewMode {
  'lock' = 'lock',
  'unlock' = 'unlock',
  'view' = 'view',
  'create' = 'create',
  'update' = 'update',
  'refund' = 'refund',
  'notify' = 'notify',
  'freeze' = 'freeze',
  'updateDiscount' = 'updateDiscount',
  'configuration' = 'configuration',
  'delete' = 'delete',
}

export enum accountStatus {
  'LINKED' = 'LINKED',
  'NOT_VERIFIED' = 'NOT_VERIFIED',
  'VERIFIED' = 'VERIFIED'
}

export interface IGetSecurityConfig {
  id: number
  phoneNumber: string
  accountName: string
  usageLimit: number
  securityMethod: string
}
