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

/** Kết quả hồ sơ eKYC của người dùng; null/undefined = chưa có hồ sơ. */
export type EkycProfileStatus =
  | 'VERIFIED'
  | 'INVALID'
  | 'EXPIRED'
  | 'REVERIFY_REQUIRED'

export type EvidenceImageType = 'FRONT' | 'BACK' | 'FACE_FAR'

/** Ảnh bằng chứng của một lần eKYC; `url` là link S3 ký sẵn, hết hạn sau vài phút. */
export interface EvidenceImage {
  fileId: string
  /** FRONT | BACK | FACE_FAR; loại khác BE thêm sau sẽ bị bỏ qua khi hiển thị. */
  type: string
  expiresAt?: string | null
  url?: string | null
}

export interface ContentEKYC {
  id?: string
  userId?: string
  username?: string | null
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
  approvalReady?: boolean
  /** Chỉ có ở response hồ sơ/chi tiết. Trong attempts[] của lưới: xem documentProfile*. */
  profileId?: string | null
  profileStatus?: EkycProfileStatus | string | null
  reviewStatus?: 'VERIFIED' | 'PENDING_REVIEW' | 'NOT_VERIFIED' | string
  pendingReview?: boolean
  faceScore?: number | null
  /** Hồ sơ đang giữ SỐ GIẤY TỜ của lần này — có thể của tài khoản khác, KHÔNG phải kết quả lần này. */
  documentProfileId?: string | null
  documentProfileStatus?: string | null
  documentOwnerUsername?: string | null
  /** true khi số giấy tờ của lần này đã thuộc hồ sơ của một tài khoản khác. */
  documentOwnedByOtherAccount?: boolean
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
  evidenceImages?: EvidenceImage[] | null
}

export interface EKYCGroup {
  groupKey: string
  /** SĐT của chính tài khoản; null khi không tra được. */
  username: string | null
  userId: string
  attemptCount: number
  /** Trạng thái PHIÊN của lần mới nhất. */
  latestStatus: string
  latestAt: string
  email: string | null
  occupation: string | null
  position: string | null
  currentAddress: string | null
  /** Hồ sơ của CHÍNH người này — kết quả chung cuộc. null = chưa xác thực. */
  profileId?: string | null
  profileStatus?: EkycProfileStatus | string | null
  reviewStatus?: 'VERIFIED' | 'PENDING_REVIEW' | 'NOT_VERIFIED' | string
  pendingReview?: boolean
  faceScore?: number | null
  fullName?: string | null
  idNumber?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  verifiedAt?: string | null
  attempts: ContentEKYC[]
}

export interface EKYCListItem extends ContentEKYC {
  userId: string
  username: string | null
  groupKey: string
  attemptCount: number
  latestStatus: string
  latestAt: string
  pendingReview?: boolean
  faceScore?: number | null
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
