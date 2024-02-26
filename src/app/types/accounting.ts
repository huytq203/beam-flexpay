import { PaymentPartnerDto, PaymentServiceDto, UserDetailDto } from "./application"

export enum AccountingTransactionType {
  TRANSFER,
  CASH_IN,
  CASH_OUT,
  BILL_PAYMENT,
  ADVANDED_COLLECT,
}

export enum AccountingFundSource {
  LINK_BANK,
  PAYMENT_GATEWAY,
  NAPAS,
  EWALLET,
}

export enum AccountingBalanceType {
  INTERNAL,
  PERSONAL,
  ENTERPRISE,
}

export enum AccountingDetailsType {
  CREDIT,
  DEBIT
}

export interface Accounting {
  id: number
  transactionType: AccountingTransactionType
  active: boolean
  fundSource: AccountingFundSource
  service: PaymentServiceDto
  partner: PaymentPartnerDto
  details: AccountingDetails[]
  createdAt: string
  createdBy: UserDetailDto
  updatedAt: string
  updatedBy: UserDetailDto
}

export interface AccountingDetails {
  id: number
  type: AccountingDetailsType
  isPositive: boolean
  balanceType: AccountingBalanceType
  internalWallet: any
}
