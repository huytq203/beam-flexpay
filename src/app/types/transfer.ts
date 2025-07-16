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
  INIT = 'INIT',
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
  RECEIVAL = 'RECEIVAL',
  TRANSFER_INTERNAL = 'TRANSFER_INTERNAL'
}
export enum TransactionSubType {
  MAIN = 'MAIN',
  PARTNER = 'PARTNER',
  /*
  Phí 
  */
  FEE = 'FEE',
  /*
    Phí VAT
  */
  VAT = 'VAT',
  /* 
    Người nhận
  */
  RECEIVER = 'RECEIVER',
  /*
    Phí VAT người nhận
  */
  RECEIVE_VAT = 'RECEIVE_VAT',
  /*
    Phí người nhận
  */
  RECEIVE_FEE = 'RECEIVE_FEE',
}

export enum FrozenStatus {
    /**
     * Giao dịch chưa được đóng băng.
     */
    NONE = 'NONE',
    /**
     * Giao dịch đã được mở đóng băng.
     */
    UNFROZEN = 'UNFROZEN',
    /**
     * Giao dịch đã bị đóng băng.
     */
    FROZEN = 'FROZEN'
}