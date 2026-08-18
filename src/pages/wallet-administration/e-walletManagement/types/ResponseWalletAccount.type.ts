export interface ResponseAccount {
  data: Account
  message: string
  detail: string
  success: boolean
  status: string
}

export interface Account {
  content: AcountItem[]
  pageable: Pageable
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: Sort2
  numberOfElements: number
  first: boolean
  empty: boolean
}

export interface AcountItem {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  ownerId: string
  ownerType: string
  ownerUsername: string
  glCode: string
  currency: string
  totalDebit: number
  totalCredit: number
  balance: number
  holdBalance: number
  availableBalance: number
  version: number
  status: string
  enabled: boolean
  checksum: string
  lockedReason?: string
  lockedAt?: string
  lockedBy?: string
  linkedBanks?: LinkedBank[]
}
export interface LinkedBank {
  id: string
  bankCode: string
  linkType: string
  maskedAccount: string
  maskedCard: string
  accountName: string
  isDefault: string
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
  unsorted: boolean
  sorted: boolean
}

export interface Sort2 {
  empty: boolean
  unsorted: boolean
  sorted: boolean
}


export interface FormSearchValues {
  username?: string
  status?: string
  kycStatus?: string
  ownerId?: string
  glCode?: string
  enabled?: string
  walletType?: string
  currency?: string
}
