export interface RootDataEKYC {
  data: DataEKYC
  message: string
  detail: string
  success: boolean
  status: string
}

export interface DataEKYC {
  content: EKYCGroup[]
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

export interface ContentEKYC {
  id?: string
  userId?: string
  username?: string
  email?: string | null
  occupation?: string | null
  position?: string | null
  sessionId?: string
  ekycSessionId?: string
  currentStep?: string | null
  idNumber?: string | null
  fullName?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  permanentAddress?: string | null
  currentAddress?: string | null
  placeOfBirth?: string | null
  placeOfOrigin?: string | null
  issueDate?: string | null
  issuePlace?: string | null
  expiryDate?: string | null
  cardType?: string | null
  oldIdNumber?: string | null
  faceMatchScore?: number | null
  verifiedAt?: string | null
  status: string
  profileId?: string | null
  profileStatus?: string | null
  documentOwnerUsername?: string | null
  startedAt?: string | null
  completedAt?: string | null
  expiresAt?: string | null
  invalidationReason?: string | null
  invalidatedAt?: string | null
  invalidatedBy?: string | null
  createdAt: string
  updatedAt?: string | null
  createdBy?: string | null
  updatedBy?: string | null
  features?: string | null
}

export interface EKYCGroup {
  groupKey: string
  username: string
  userId: string
  attemptCount: number
  latestStatus: string
  latestAt: string
  email: string | null
  occupation: string | null
  position: string | null
  currentAddress: string | null
  attempts: ContentEKYC[]
}

export interface EKYCListItem extends ContentEKYC {
  userId: string
  username: string
  groupKey: string
  attemptCount: number
  latestStatus: string
  latestAt: string
  email: string | null
  occupation: string | null
  position: string | null
  attempts: ContentEKYC[]
  no: number
  key: string

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
