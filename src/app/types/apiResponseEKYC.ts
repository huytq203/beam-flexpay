export interface RootDataEKYC {
  data: DataEKYC
  message: string
  detail: string
  success: boolean
  status: string
}

export interface DataEKYC {
  content: ContentEKYC[]
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
  id: string
  userId: string
  username: string
  ekycSessionId: string
  idNumber: string
  fullName: string
  dateOfBirth: string
  gender: string
  nationality: string
  permanentAddress: string
  currentAddress: string
  placeOfBirth: string
  issueDate: string
  issuePlace: string
  expiryDate: string
  cardType: string
  oldIdNumber: string
  faceMatchScore: number
  verifiedAt: string
  status: string
  invalidationReason: string
  invalidatedAt: string
  invalidatedBy: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
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
