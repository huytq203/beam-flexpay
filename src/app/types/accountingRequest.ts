import i18n from '@languages/i18n'
import { InternalWallet } from './internalWallet'
import { Pagination } from './table'
import { transactionType } from '@pages/policy-management/limit-management/LimitAndRegulationsConst'

export interface AccountingRequestBody{
  from: number,
  walletNumberFrom: string,
  to: number,
  walletNumberTo: string,
  amount: number,
  transactionType: AccountingRequestTransactionType,
  reason: string
}

export interface AccountingRequestPayload {
  order?: string
  page: number
  take?: number
  query?: string
  orderBy?: string
  walletNumber?: string;
  transactionType?: AccountingRequestTransactionType
  status?: TransactionAccountingRequest
  startDate?: string;
  endDate?: string;
}

export interface AccountingRequestParamsInterface {  
  walletNumber?: string;
  transactionType?: AccountingRequestTransactionType
  status?: TransactionAccountingRequest
  startDate?: string;
  endDate?: string;
}

export interface AccountingRequestResponse {
  data: AccountingRequest[]
  meta: Pagination
  statusCode: number
  message: string
}

export interface AccountingRequest {
  id: number
  from: InternalWallet
  wallet_number_from: string
  to: InternalWallet
  wallet_number_to: string
  amount: number
  transaction_type: string
  reason: string
  transaction_id: string
  status: string
  createdAt: string
}

export enum AccountingRequestTransactionType {
  DEPOSIT = 'DEPOSIT',
  CLAIM = 'CLAIM'
}

export enum TransactionAccountingRequest {
  COMMITTED = 'COMMITTED',
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECT = 'REJECT'
}
export const TransactionTypeOptions = [
  {
    label: i18n.t('internal-wallet.transaction_type.Deposite'),
    value: AccountingRequestTransactionType.DEPOSIT
  },
  {
    label: i18n.t('internal-wallet.transaction_type.Claim'),
    value: AccountingRequestTransactionType.CLAIM
  }
]
export const RequestStatusOptions = [
  {
    label: i18n.t('internal-wallet.account-request-status.Committed'),
    value: TransactionAccountingRequest.COMMITTED
  },
  {
    label: i18n.t('internal-wallet.account-request-status.Approved'),
    value: TransactionAccountingRequest.APPROVED
  },
  {
    label: i18n.t('internal-wallet.account-request-status.Pending'),
    value: TransactionAccountingRequest.PENDING
  },
  {
    label: i18n.t('internal-wallet.account-request-status.Rejected'),
    value: TransactionAccountingRequest.REJECT
  }
]

export const getAccountingRequestStatus = (status: string) => {
  switch (status) {
    case TransactionAccountingRequest.COMMITTED:
      return {
        label: i18n.t('internal-wallet.account-request-status.Committed'),
        value: 'success'
      }
    case TransactionAccountingRequest.PENDING:
      return {
        label: i18n.t('internal-wallet.account-request-status.Pending'),
        value: 'geekblue'
      }
    case TransactionAccountingRequest.APPROVED:
      return {
        label: i18n.t('internal-wallet.account-request-status.Approved'),
        value: '#87d068'
      }
    case TransactionAccountingRequest.REJECT:
      return {
        label: i18n.t('internal-wallet.account-request-status.Rejected'),
        value: 'error'
      }
  }
}

export const getTransactionTypeAccounting = (type: string) => {
  switch (type) {
    case AccountingRequestTransactionType.DEPOSIT:
      return {
        label: i18n.t('internal-wallet.transaction_type.Deposite'),
        value: '#2db7f5'
      }
    case AccountingRequestTransactionType.CLAIM:
      return {
        label: i18n.t('internal-wallet.transaction_type.Claim'),
        value: '#f50'
      }
  }
}
