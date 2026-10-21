export interface Root {
  data: DataAccountWallet
  message: string
  detail: string
  success: boolean
  status: string
}

export interface DataAccountWallet {
  content: ContentAccountWallet[]
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
export interface ContentAccountWallet {
  id: string
  ownerId: string
  ownerType: string
  ownerUsername: string
  ownerFullName?: string | null
  ekycStatus?: 'NOT_VERIFIED' | 'VERIFIED' | null
  walletCode?: string | null
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
  lockedReason: string
  lockedAt: string
  lockedBy: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  linkedBanks: LinkedBank[]
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
  unpaged: boolean
  paged: boolean
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
