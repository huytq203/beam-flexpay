import { CustomerTable, accountStatus } from './customer'
import { Pagination } from './table'

export interface GroupAccountInterface {
  customerType: CustomerType
  id: number
  name: string
  totalCustomer: number
  customers: CustomerTable[]
}

export interface GroupAccountParamsInterface {
  page?: number
  take?: number
  customerAccountNumber?: string
  name?: string
  customerType?: CustomerType
  status?: accountStatus
}

export interface GroupAccountBody {
  name: string
  customerType: CustomerType
  customerIds: number[]
}

export enum CustomerType {
  PERSONAL = 'PERSONAL',
  ENTERPRISE = 'ENTERPRISE'
}

export enum VerifiedOptions {
  NOT_VERIFICATION = 'NOT_VERIFICATION',
  KYC_VERIFICATION = 'KYC_VERIFICATION'
}

export interface ResponseGroupData {
  data: GroupAccountInterface[]
  meta: Pagination
}

export interface GroupDataInterface extends CustomerTable {
  customerType: CustomerType
  groupId: number
  name: string
  totalCustomer: number
  pointItem: number
}

export interface OptionInterface {
  value: number | string
  labe: string
}
