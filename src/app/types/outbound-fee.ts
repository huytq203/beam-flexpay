// ===== DEPRECATED - DO NOT USE =====
// This interface is kept for backward compatibility only
// Use OutboundFeeFindAllApiArg instead
/** @deprecated Use OutboundFeeFindAllApiArg instead */
export interface OutboundFeeSearchParams {
  method?: string
  provider?: string
  createdFrom?: string
  createdTo?: string
  appliedFrom?: string
  appliedTo?: string
  chargeWithin?: string
  applicationType?: string
  transactionType?: string
  bank?: string
  accountGroup?: string
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
  // Status workflow fields
  status: OutboundFeeStatus
  approvedAt?: string
  rejectedAt?: string
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
  // Deposit methods
  ATM_CARD = 'atm_card',
  QR_CODE = 'qr_code',
  BANK_ACCOUNT = 'bank_account',
  BANK_ACCOUNT_IB = 'bank_account_ib', // Internet Banking
  // Withdrawal methods
  ATM_IBFT = 'atm_ibft', // ATM via IBFT
  BANK_ACCOUNT_IBFT = 'bank_account_ibft', // Bank account via IBFT
  // Payment/Refund methods
  EWALLET = 'ewallet',
  BANK_COUNT = 'bank_count', // Bank account (for compatibility)
  VISA_INTERNATIONAL = 'visa_international',
  MASTER_INTERNATIONAL = 'master_international',
  JCB_INTERNATIONAL = 'jcb_international',
  AMEX_INTERNATIONAL = 'amex_international'
}

export enum OutboundFeeProvider {
  ALL = 'all',
  VPBANK = 'vpbank',
  VPB = 'vpbank', // Alias for VPBANK
  NAPAS = 'napas',
  VIETQR = 'vietqr'
}

export enum OutboundFeeApplicationType {
  SYSTEM = 'system',
  INDIVIDUAL = 'individual',
  ACCOUNT_GROUP = 'account_group'
}

export enum OutboundFeeStatus {
  PENDING_APPROVAL = 'pending_approval', // Chờ duyệt
  APPROVED = 'approved',                 // Đã duyệt
  ACTIVE = 'active',                     // Đang áp dụng
  REJECTED = 'rejected',                 // Đã từ chối
  EXPIRED = 'expired'                    // Đã hết hạn
}

// Type definitions for better type safety
export const ApplicationTypes = ['system', 'individual', 'account_group'] as const
export const TransactionTypes = ['deposit', 'withdrawal', 'payment', 'transfer', 'refund'] as const

export type ApplicationType = typeof ApplicationTypes[number]
export type TransactionType = typeof TransactionTypes[number]

// Define allowed methods for each transaction type
export const MethodsByTransactionType = {
  deposit: [
    OutboundFeeMethod.ALL,
    OutboundFeeMethod.ATM_CARD,
    OutboundFeeMethod.QR_CODE,
    OutboundFeeMethod.BANK_ACCOUNT
  ],
  withdrawal: [
    OutboundFeeMethod.ALL,
    OutboundFeeMethod.ATM_CARD,
    OutboundFeeMethod.BANK_ACCOUNT
  ],
  payment: [
    OutboundFeeMethod.ALL,
    OutboundFeeMethod.QR_CODE,
    OutboundFeeMethod.VISA_INTERNATIONAL,
    OutboundFeeMethod.MASTER_INTERNATIONAL,
    OutboundFeeMethod.JCB_INTERNATIONAL,
    OutboundFeeMethod.AMEX_INTERNATIONAL
  ],
  transfer: [
    OutboundFeeMethod.ALL,
    OutboundFeeMethod.BANK_ACCOUNT,
    OutboundFeeMethod.EWALLET
  ],
  refund: [
    OutboundFeeMethod.ALL,
    OutboundFeeMethod.ATM_CARD,
    OutboundFeeMethod.BANK_ACCOUNT,
    OutboundFeeMethod.EWALLET
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
    (method) => !allowedMethods.includes(method as any)
  )

  return {
    valid: invalidMethods.length === 0,
    ...(invalidMethods.length > 0 && { invalidMethods })
  }
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
  // ===== REQUIRED FIELDS =====
  priceFrom: number // Min: 0, Max: 999,999,999,999
  priceTo: number // Min: 1, Max: 999,999,999,999
  startDate: string // ISO 8601 format (UTC)
  chargeWithin: boolean // Thu phí trong/ngoài

  // ===== OPTIONAL DATE =====
  endDate?: string // ISO 8601 format (UTC), null = vô hạn

  // ===== PAYER FEES (Optional) =====
  payerFlexibleFeeMpct?: number // Min: 0, Max: 100,000 (mpct - mini percent)
  payerFixedFee?: number // Min: 0, Max: 999,999,999,999
  payerMinFee?: number // Min: 0, Max: 999,999,999,999
  payerMaxFee?: number // Min: 0, Max: 999,999,999,999

  // ===== RECEIVER FEES (Optional) =====
  receiverFlexibleFeeMpct?: number // Min: 0, Max: 100,000 (mpct - mini percent)
  receiverFixedFee?: number // Min: 0, Max: 999,999,999,999
  receiverMinFee?: number // Min: 0, Max: 999,999,999,999
  receiverMaxFee?: number // Min: 0, Max: 999,999,999,999
}

export interface OutboundFeeCreateApiArg {
  createOutboundFeeDto: CreateOutboundFeeDto
}

export interface OutboundFeeCreateApiResponse {
  id: string
}

/**
 * Outbound Fee Find All API Request Parameters
 * Matches backend API specification exactly
 */
export interface OutboundFeeFindAllApiArg {
  // ===== REQUIRED PAGINATION =====
  page: number
  take: number

  // ===== OPTIONAL SORTING =====
  order?: 'ASC' | 'DESC'
  orderBy?: string

  // ===== DATE RANGE FILTERS =====
  createdFrom?: string // ISO 8601 format
  createdTo?: string // ISO 8601 format
  appliedFrom?: string // ISO 8601 format (filters by startDate)
  appliedTo?: string // ISO 8601 format (filters by endDate)

  // ===== SINGLE-SELECT FILTERS =====
  applicationType?: OutboundFeeApplicationType | 'all'
  transactionType?: OutboundFeeTransactionType | 'all'
  customerId?: number // For applicationType = 'individual'
  chargeWithin?: boolean // true = charge within, false = no charge within, undefined = all
  status?: OutboundFeeStatus // Status filter for approval workflow

  // ===== MULTI-SELECT FILTERS (Arrays) =====
  accountGroupIds?: number[] // For applicationType = 'account_group'
  bankIds?: number[] // Bank IDs array
  methods?: OutboundFeeMethod[] // Payment methods array
  providers?: OutboundFeeProvider[] // Provider array
}

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

export interface OutboundFeeUpdateApiResponse extends OutboundFeeType {
}

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
  phoneNumber?: string
  accountGroupId?: string
  accountGroupName?: string
  bankId?: string
  bankName?: string
  bankIds?: number[]
  banks?: Array<{ id: number; name: string }>
  transactionType: string
  methods: string[]
  providers: string[]
  chargeWithin: boolean | number // API returns 1/0 as number
  priceFrom?: number
  priceTo?: number
  payerFlexibleFeeMpct?: number | null
  payerFixedFee?: number | null
  payerMinFee?: number | null
  payerMaxFee?: number | null
  receiverFlexibleFeeMpct?: number | null
  receiverFixedFee?: number | null
  receiverMinFee?: number | null
  receiverMaxFee?: number | null
  startDate: string
  endDate?: string | null
  createdAt?: string
  updatedAt?: string
  active?: number
  // Status workflow fields
  status?: OutboundFeeStatus
  approvedAt?: string
  rejectedAt?: string
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

// ===== APPROVAL WORKFLOW API TYPES =====

/**
 * Approve outbound fee API request
 */
export interface OutboundFeeApproveApiArg {
  id: string
}

/**
 * Approve outbound fee API response
 */
export interface OutboundFeeApproveApiResponse {
  id: string
}

/**
 * Reject outbound fee API request
 */
export interface OutboundFeeRejectApiArg {
  id: string
}

/**
 * Reject outbound fee API response
 */
export interface OutboundFeeRejectApiResponse {
  id: string
}
