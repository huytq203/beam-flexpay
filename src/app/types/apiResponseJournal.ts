export interface PartyInfo {
  id: string
  username: string
  displayName: string
  type: string
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
  paymentMethod: string
  bankCode: string | null
  bankRefId: string | null
  transactionId: string
  reversesJournalId: string | null
  reversedByJournalId: string | null
  description: string
  failureReason: string | null
  details?: Record<string, unknown>
  createdAt: string
  postedAt: string | null
  archivedAt: string | null
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
  bankCode: any
  bankRefId: any
  transactionId: string
  reversesJournalId: any
  reversedByJournalId: any
  description: string
  failureReason: any
  createdAt: string
  postedAt: string
  archivedAt: any
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
