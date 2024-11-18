import { PageMeta } from './api'

export enum ReportType {
  /**
   * Giá trị giao dịch cao nhất
   */
  HIGHEST_TRANSACTION_VALUE = 'HIGHEST_TRANSACTION_VALUE',
  /**
   * Số lượng giao dịch cao nhất
   */
  HIGHEST_NUMBER_TRANSACTIONS = 'HIGHEST_NUMBER_TRANSACTIONS'
}
export interface CustomerTableReport {
  id: string
  phoneNumber: string
  fullName: string
  identityNumber: number
  openingBalance: number
  closingBalance: number
  status: string
  linkBank: string
  updatedAt: string
}
export interface AccountGuaranteeTableReport {
  id: string
  name: string
  walletNumber: string
  availableMoney: number
  updatedAt: string
  linkBank: string
}
export interface IStateBank<T> {
  data: T
  meta: PageMeta
}
