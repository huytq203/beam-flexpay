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
  customerId?: number | null
  fullname?: string | null
  phoneNumber?: string | null
  accountGroupId?: number | null
  accountGroupName?: string | null
  bankIds?: number[]
  banks?: Array<{ id: number; name: string }>
  active?: number
  transactionType: string
  methods: string[]
  providers: string[]
  priceFrom?: number
  priceTo?: number
  flexibleFeeMpct?: number | null
  fixedFee?: number | null
  minFee?: number | null
  maxFee?: number | null
  vatMpct?: number | null
  createdAt: string
  updatedAt: string
  startDate: string
  endDate?: string | null
  status?: 'active' | 'inactive' | 'expired'
}

export interface CreateInboundFeeDto {
  // Required fields
  applicationType: 'system' | 'individual' | 'account_group'
  transactionType: 'deposit' | 'withdrawal' | 'payment' | 'transfer' | 'refund'
  methods: string[] // Array of FeeMethod (minimum 1)
  providers: string[] // Array of FeeProvider (minimum 1)
  priceFrom: number // Required: 0 to 999,999,999,999
  priceTo: number // Required: 0 to 999,999,999,999
  startDate: string // Required: ISO 8601 string

  // Optional fields based on applicationType
  customerId?: number // Required when applicationType = 'individual'
  accountGroupId?: number // Required when applicationType = 'account_group'
  bankIds?: number[] // Array of bank IDs
  endDate?: string // ISO 8601 string

  // Fee configuration
  flexibleFeeMpct?: number // 0-100000 (in mpct - mini percent)
  fixedFee?: number // 0 to 999,999,999,999
  minFee?: number // 0 to 999,999,999,999
  maxFee?: number // 0 to 999,999,999,999

  // VAT (renamed from vat)
  vatMpct?: number // 0-100000 (in mpct - mini percent)
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
  vatMpct?: number // Renamed from vat
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
  // Deposit methods
  ATM_CARD = 'atm_card',
  QR_CODE = 'qr_code',
  BANK_ACCOUNT_IB = 'bank_account_ib', // Internet Banking
  // Withdrawal methods
  ATM_IBFT = 'atm_ibft', // ATM via IBFT
  BANK_ACCOUNT_IBFT = 'bank_account_ibft', // Bank account via IBFT
  // Payment/Refund methods
  EWALLET = 'ewallet',
  BANK_COUNT = 'bank_count', // Bank account (replaced bank_account)
  VISA_INTERNATIONAL = 'visa_international',
  MASTER_INTERNATIONAL = 'master_international',
  JCB_INTERNATIONAL = 'jcb_international',
  AMEX_INTERNATIONAL = 'amex_international'
}

export enum InboundFeeProvider {
  ALL = 'all',
  VPBANK = 'vpbank',
  VPB = 'vpbank', // Alias for VPBANK
  NAPAS = 'napas',
  VIETQR = 'vietqr'
}

export enum InboundFeeApplicationType {
  SYSTEM = 'system',
  INDIVIDUAL = 'individual',
  ACCOUNT_GROUP = 'account_group'
}

// Type definitions for better type safety
export const ApplicationTypes = ['system', 'individual', 'account_group'] as const
export const TransactionTypes = ['deposit', 'withdrawal', 'payment', 'transfer', 'refund'] as const

export type ApplicationType = typeof ApplicationTypes[number]
export type TransactionType = typeof TransactionTypes[number]

// Define allowed methods for each transaction type
export const MethodsByTransactionType = {
  deposit: [
    InboundFeeMethod.ALL,
    InboundFeeMethod.ATM_CARD,
    InboundFeeMethod.QR_CODE,
    InboundFeeMethod.BANK_ACCOUNT_IB
  ],
  withdrawal: [
    InboundFeeMethod.ALL,
    InboundFeeMethod.ATM_IBFT,
    InboundFeeMethod.BANK_ACCOUNT_IBFT
  ],
  payment: [
    InboundFeeMethod.ALL,
    InboundFeeMethod.EWALLET,
    InboundFeeMethod.BANK_COUNT,
    InboundFeeMethod.VISA_INTERNATIONAL,
    InboundFeeMethod.MASTER_INTERNATIONAL,
    InboundFeeMethod.JCB_INTERNATIONAL,
    InboundFeeMethod.AMEX_INTERNATIONAL,
    InboundFeeMethod.QR_CODE
  ],
  refund: [
    InboundFeeMethod.ALL,
    InboundFeeMethod.EWALLET,
    InboundFeeMethod.BANK_COUNT,
    InboundFeeMethod.VISA_INTERNATIONAL,
    InboundFeeMethod.MASTER_INTERNATIONAL,
    InboundFeeMethod.JCB_INTERNATIONAL,
    InboundFeeMethod.AMEX_INTERNATIONAL,
    InboundFeeMethod.QR_CODE
  ],
  transfer: [
    InboundFeeMethod.ALL,
    InboundFeeMethod.EWALLET
  ]
} as const

// Helper type for method validation
export type AllowedMethodsMap = typeof MethodsByTransactionType

/**
 * Check if fee methods are valid for the given transaction type
 */
export const validateMethodsForTransactionType = (
  transactionType: TransactionType,
  methods: string[]
): { valid: boolean; invalidMethods?: string[] } => {
  const allowedMethods = MethodsByTransactionType[transactionType]
  if (!allowedMethods) {
    return { valid: false, invalidMethods: methods }
  }

  const invalidMethods = methods.filter(
    method => !allowedMethods.includes(method as any)
  )

  return {
    valid: invalidMethods.length === 0,
    invalidMethods: invalidMethods.length > 0 ? invalidMethods : undefined
  }
}