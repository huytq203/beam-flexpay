import { IPageSearch } from './api'
import { Pagination } from './table'

export interface ITransactionResponse {
  data: ITransferHistoryTable[]
  meta: Pagination
}

export interface ITransactionInfo {
  orderId: string
  refCode: string
  amount: string
}

export interface ITransferHistoryTable {
  id: number
  no: number
  code: string
  type: string
  createdAt: string
  amount: number
  fee: number
  status: string
  transactionInfo: ITransactionInfo
  gateway: string
  from: string
  note: string
  to: string
}

export interface ITransferHistorySearch extends IPageSearch {
  transferNumber?: number
  accountName?: string
  transferTime?: string
  from?: string
  to?: string
  transferType?: string
  status?: string
  orderBy?: string
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
  REFUND_SUCCESS = 'REFUND_SUCCESS'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  // TODO 27/05/2023 change WITHDRAWAL => WITHDRAW
  WITHDRAWAL = 'WITHDRAWAL',
  WITHDRAW = 'WITHDRAW',
  TOPUP = 'TOPUP',
  RECEIVE = 'RECEIVE',
  RECEIVAL = 'RECEIVAL'
}
