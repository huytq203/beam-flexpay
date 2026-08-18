export interface PartyInfo {
  id: string | null
  username: string | null
  displayName: string | null
  type: string
}

export interface TransactionFreezeSummary {
  heldAmount: number
  shortfallAmount: number
  requestedAmount: number
  orderCount: number
}

export interface UnifiedContentJournal {
  id: string
  journalCode: string
  transactionCode:string
  status: string
  transactionType: string
  from: PartyInfo
  to: PartyInfo
  amount: number
  grossAmount: number
  feeAmount: number
  currency: string
  feeCalculationId?: string | null
  paymentMethod: string
  bankCode: string | null
  bankRefId: string | null
  maskedAccount?: string | null
  transactionId: string | null
  reversesJournalId: string | null
  reversedByJournalId: string | null
  description: string
  failureReason: string | null
  details?: Record<string, unknown>
  createdAt: string
  postedAt: string | null
  archivedAt: string | null
  completedAt?: string | null
  sourceDomain: string
  frozen?: boolean
  freeze?: TransactionFreezeSummary | null
}

export interface MoneyFlowEntry {
  sequence: number
  step: string | null
  debitAccount: string | null
  creditAccount: string | null
  amount: number
  occurredAt: string | null
}

export interface UserFeeBreakdownItem {
  componentType: string
  fixedAmount: number | null
  percentage: number | null
  baseValue: number | null
  percentageFee: number | null
  calculatedFee: number
}

export interface TransactionProfit {
  userFeeTotal: number
  userFeeBreakdown: UserFeeBreakdownItem[]
  feeBreakdownAvailable: boolean
  feePolicyName: string | null
  feePolicyValidFrom: string | null
  providerCost: number | null
  providerCostAvailable: boolean
  grossProfit: number
  grossProfitLabel: string
}

export interface TransactionCustomer {
  userId: string | null
  username: string | null
  fullName: string | null
  walletAccountId: string | null
  walletGlCode: string | null
  walletStatus: string | null
  walletEnabled: boolean | null
  tier: string | null
  ekycStatus: string | null
}

export interface TransactionDetail360 {
  transaction: UnifiedContentJournal
  profit?: TransactionProfit | null
  moneyFlow: MoneyFlowEntry[]
  customer?: TransactionCustomer | null
}

export interface DataUnifiedJournal {
  content: UnifiedContentJournal[]
  pageable?: Pageable
  last?: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  first?: boolean
  sort?: Sort2
  numberOfElements?: number
  empty?: boolean
}

export interface UnifiedJournalResponse {
  data: DataUnifiedJournal
  message: string
  detail: string
  success: boolean
  status: string
}

export interface JournalResponse {
  data: DataJournal
  message: string
  detail: string
  success: boolean
  status: string
}

export interface DataJournal {
  content: ContentJournal[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  sort: Sort2
  numberOfElements: number
  empty: boolean
}

export interface ContentJournal {
  id: string
  journalCode: string
  status: string
  transactionType: string
  initiatorId: string
  initiatorUsername: string
  counterpartyId: string
  counterpartyUsername: string
  counterpartyType: string
  amount: number
  grossAmount: number
  feeAmount: number
  currency: string
  paymentMethod: string
  bankCode: string | null
  bankRefId: string | null
  transactionId: string
  reversesJournalId: string | null
  reversedByJournalId: string | null
  description: string
  failureReason: string | null
  createdAt: string
  postedAt: string
  archivedAt: string | null
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: Sort
  offset: number
  paged: boolean
  unpaged: boolean
}

export interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface Sort2 {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}
