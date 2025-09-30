export interface OutboundFeeSearchParams {
  // Required fields
  method:
    | 'all'
    | 'atm_card'
    | 'qr_code'
    | 'bank_account'
    | 'ewallet'
    | 'visa_international'
    | 'master_international'
    | 'jcb_international'
    | 'amex_international'
  provider: 'all' | 'vietqr' | 'napas'

  // Optional time fields
  createdFrom?: string // Date in ISO format
  createdTo?: string
  appliedFrom?: string
  appliedTo?: string

  // Optional filter fields
  chargeWithin?: 'all' | 'system' | 'outside'
  applicationType?: 'system' | 'individual' | 'account_group'
  transactionType?: 'deposit' | 'withdrawal' | 'payment' | 'transfer' | 'refund'
  bank?: string
  accountGroup?: string

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

export type OutboundFeeType = {
  id: string
  applicationType: string
  transactionType: string
  method: string
  bank: string
  provider: string
  accountGroup: string
  chargeWithin: string
  priceFrom: number
  priceTo: number
  payerFlexibleFeeMpct: number
  payerFixedFee: number
  payerMinFee: number
  payerMaxFee: number
  receiverFlexibleFeeMpct: number
  receiverFixedFee: number
  receiverMinFee: number
  receiverMaxFee: number
  createdAt: string
  startDate: string
  endDate: string
}

export enum OutboundFeeTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  TRANSFER = 'transfer',
  REFUND = 'refund'
}

export enum OutboundFeeMethod {
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

export enum OutboundFeeProvider {
  ALL = 'all',
  VIETQR = 'vietqr',
  NAPAS = 'napas',
  VPB = 'vpb'
}

export enum OutboundFeeApplicationType {
  SYSTEM = 'system',
  INDIVIDUAL = 'individual',
  ACCOUNT_GROUP = 'account_group'
}

export interface CreateOutboundFeeDto {
  // Required fields
  applicationType: OutboundFeeApplicationType
  transactionType: OutboundFeeTransactionType
  method: OutboundFeeMethod
  provider: OutboundFeeProvider
  chargeWithin: boolean
  startDate: string // ISO 8601 string

  // Optional fields based on applicationType
  customerId?: number // For applicationType = 'individual'
  accountGroupId?: number // For applicationType = 'account_group'
  bankId?: number // Bank ID
  endDate?: string // ISO 8601 string

  // Price range
  priceFrom?: number
  priceTo?: number

  // Payer fees
  payerFlexibleFeeMpct?: number // 0-100000 (in mpct - mini percent)
  payerFixedFee?: number
  payerMinFee?: number
  payerMaxFee?: number

  // Receiver fees
  receiverFlexibleFeeMpct?: number // 0-100000 (in mpct - mini percent)
  receiverFixedFee?: number
  receiverMinFee?: number
  receiverMaxFee?: number
}

export interface UpdateOutboundFeeDto {
  name?: string
  amount?: number
  description?: string
  isActive?: boolean
}

export interface OutboundFeeCreateApiArg {
  createOutboundFeeDto: CreateOutboundFeeDto
}

export interface OutboundFeeCreateApiResponse {
  id: string
}

export interface OutboundFeeFindAllApiArg extends OutboundFeeSearchParams {}

export interface OutboundFeeFindAllApiResponse {
  data: OutboundFeeType[]
  total: number
  page: number
  take: number
  meta?: Pagination
}

export interface OutboundFeeUpdateApiArg {
  id: string
  updateOutboundFeeDto: UpdateOutboundFeeDto
}

export interface OutboundFeeUpdateApiResponse extends OutboundFeeType {}

export interface OutboundFeeRemoveApiArg {
  id: string
}

export interface OutboundFeeRemoveApiResponse {
  success: boolean
  message: string
}

export interface OutboundFeePayload {
  data: {
    data: OutboundFeeType[]
    meta: Pagination
  }
}

// Additional types for new APIs
export interface OutboundFeeFindOneApiArg {
  id: string
}

export interface OutboundFeeFindOneApiResponse {
  id: string
  applicationType: string
  customerId?: string
  fullname?: string
  accountGroupId?: string
  accountGroupName?: string
  bankId?: string
  bankName?: string
  transactionType: string
  method: string
  provider: string
  chargeWithin: boolean
  priceFrom?: number
  priceTo?: number
  payerFlexibleFeeMpct?: number
  payerFixedFee?: number
  payerMinFee?: number
  payerMaxFee?: number
  receiverFlexibleFeeMpct?: number
  receiverFixedFee?: number
  receiverMinFee?: number
  receiverMaxFee?: number
  startDate: string
  endDate?: string
}

export interface AccountGroup {
  id: string
  name: string
  code: string
}

export interface Account {
  id: string
  accountNumber: string
  phoneNumber: string
  name: string
  displayName: string
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

export interface OutboundFeeGetAccountGroupsApiResponse {
  data: AccountGroup[]
}

export interface OutboundFeeGetAccountsApiResponse {
  data: Account[]
}

export interface OutboundFeeGetBanksApiResponse {
  data: Bank[]
}

export interface OutboundFeeGetProvidersApiResponse {
  data: Provider[]
}

export interface OutboundFeeGetBanksListApiResponse {
  id: number
  name: string
  bankCode: string
}

export interface OutboundFeeGetAccountGroupsListApiResponse {
  id: number
  name: string
}

export interface Customer {
  id: number
  fullName: string
  phoneNumber: string
}

export interface OutboundFeeCustomerSearchApiArg {
  query?: string
  page?: number
  take?: number
  order?: 'ASC' | 'DESC'
  orderBy?: string
}

export interface OutboundFeeCustomerSearchApiResponse {
  data: Customer[]
  meta: Pagination
}
