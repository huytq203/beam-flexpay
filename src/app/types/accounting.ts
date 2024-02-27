import { PaymentPartnerDto, PaymentServiceDto, UserDetailDto } from "./application"

export enum AccountingTransactionType {
  TRANSFER = "TRANSFER",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  BILL_PAYMENT = "BILL_PAYMENT",
  ADVANDED_COLLECT = "ADVANDED_COLLECT",
}

export enum AccountingFundSource {
  LINK_BANK = "LINK_BANK",
  PAYMENT_GATEWAY = "PAYMENT_GATEWAY",
  NAPAS = "NAPAS",
  EWALLET = "EWALLET",
}

export enum AccountingBalanceType {
  INTERNAL = "INTERNAL",
  PERSONAL = "PERSONAL",
  ENTERPRISE = "ENTERPRISE",
}

export enum AccountingDetailsType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
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