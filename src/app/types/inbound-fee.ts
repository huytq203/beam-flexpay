export interface InboundFeeSearchParams {
  // Required fields
  method: 'all' | 'atm_card' | 'qr_code' | 'bank_account' | 'ewallet' | 'visa_international' | 'master_international' | 'jcb_international' | 'amex_international'
  provider: 'all' | 'vietqr' | 'napas' | 'vpb'

  // Optional time fields
  createdFrom?: string // Date in ISO format
  createdTo?: string
  appliedFrom?: string
  appliedTo?: string

  // Optional filter fields
  applicationType?: 'system' | 'individual' | 'account_group'
  transactionType?: 'deposit' | 'withdrawal' | 'payment' | 'transfer' | 'refund'
  bank?: string
  accountGroup?: string
  accountId?: string

  // Pagination fields
  page?: number
  take?: number
  order?: 'ASC' | 'DESC'
  orderBy?: string
  query?: string
}

export interface Pagination {
  page: number
  take: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type InboundFeeType = {
  id: string
  applicationType: string
  customerId?: number
  fullname?: string
  phoneNumber?: string
  accountGroupId?: number
  accountGroupName?: string
  bankId?: number
  bankName?: string
  transactionType: string
  method: string
  provider: string
  priceFrom?: number
  priceTo?: number
  flexibleFeeMpct?: number
  fixedFee?: number
  minFee?: number
  maxFee?: number
  vat?: number
  createdAt: string
  startDate: string
  endDate?: string
  status?: 'active' | 'inactive' | 'expired'
}

export interface CreateInboundFeeDto {
  // Required fields
  applicationType: 'system' | 'individual' | 'account_group'
  transactionType: 'deposit' | 'withdrawal' | 'payment' | 'transfer' | 'refund'
  method: string // Single value from form (after processing)
  provider: string // Single value from form (after processing)
  startDate: string // ISO 8601 string

  // Optional fields based on applicationType
  customerId?: number // For applicationType = 'individual'
  accountGroupId?: number // For applicationType = 'account_group'
  bankId?: number // Bank ID
  endDate?: string // ISO 8601 string

  // Price range
  priceFrom?: number
  priceTo?: number

  // Fee configuration (combined payer + receiver fees)
  flexibleFeeMpct?: number // 0-100000 (in mpct - mini percent)
  fixedFee?: number
  minFee?: number
  maxFee?: number

  // VAT
  vat?: number // 0-100 (percentage)
}

export interface UpdateInboundFeeDto {
  // Optional fields for update
  startDate?: string
  endDate?: string
  priceFrom?: number
  priceTo?: number
  flexibleFeeMpct?: number
  fixedFee?: number
  minFee?: number
  maxFee?: number
  vat?: number
}

export interface InboundFeeCreateApiArg {
  createInboundFeeDto: CreateInboundFeeDto
}

export interface InboundFeeCreateApiResponse {
  id: string
  message?: string
}

export interface InboundFeeFindAllApiArg extends InboundFeeSearchParams {}

export interface InboundFeeFindAllApiResponse {
  data: InboundFeeType[]
  total: number
  page: number
  take: number
  meta?: Pagination
}

export interface InboundFeeUpdateApiArg {
  id: string
  updateInboundFeeDto: UpdateInboundFeeDto
}

export interface InboundFeeUpdateApiResponse extends InboundFeeType {}

export interface InboundFeeRemoveApiArg {
  id: string
}

export interface InboundFeeRemoveApiResponse {
  success: boolean
  message: string
}

export interface InboundFeePayload {
  data: {
    data: InboundFeeType[]
    meta: Pagination
  }
}

// Additional types for new APIs
export interface InboundFeeFindOneApiArg {
  id: string
}

export interface InboundFeeFindOneApiResponse extends InboundFeeType {}

// Shared types with outbound fee
export interface AccountGroup {
  id: string
  name: string
  code: string
  description?: string
}

export interface Account {
  id: string
  accountNumber: string
  phoneNumber: string
  name: string
  displayName: string
  walletName?: string
}

export interface Bank {
  id: string
  name: string
  code: string
  shortName: string
}

export interface Provider {
  id: string
  name: string
  code: string
}

// Mock data response types
export interface InboundFeeGetAccountGroupsApiResponse {
  data: AccountGroup[]
}

export interface InboundFeeGetAccountsApiResponse {
  data: Account[]
}

export interface InboundFeeGetBanksApiResponse {
  data: Bank[]
}

export interface InboundFeeGetProvidersApiResponse {
  data: Provider[]
}

export interface InboundFeeGetBanksListApiResponse {
  id: number
  name: string
  bankCode: string
}

export interface InboundFeeGetAccountGroupsListApiResponse {
  id: number
  name: string
}

export interface Customer {
  id: number
  fullName: string
  phoneNumber: string
}

export interface InboundFeeCustomerSearchApiArg {
  query?: string
  page?: number
  take?: number
  order?: 'ASC' | 'DESC'
  orderBy?: string
}

export interface InboundFeeCustomerSearchApiResponse {
  data: Customer[]
  meta: Pagination
}

export enum InboundFeeTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  TRANSFER = 'transfer',
  REFUND = 'refund'
}

export enum InboundFeeMethod {
  ALL = 'all',
  ATM_CARD = 'atm_card',
  QR_CODE = 'qr_code',
  BANK_ACCOUNT = 'bank_account',
  EWALLET = 'ewallet',
  VISA_INTERNATIONAL = 'visa_international',
  MASTER_INTERNATIONAL = 'master_international',
  JCB_INTERNATIONAL = 'jcb_international',
  AMEX_INTERNATIONAL = 'amex_international'
}

export enum InboundFeeProvider {
  ALL = 'all',
  VIETQR = 'vietqr',
  NAPAS = 'napas',
  VPB = 'vpb'
}

export enum InboundFeeApplicationType {
  SYSTEM = 'system',
  INDIVIDUAL = 'individual',
  ACCOUNT_GROUP = 'account_group'
}