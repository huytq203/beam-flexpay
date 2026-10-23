/** Contracts for the Merchant Admin API. Keep server fields intact at this boundary. */
export interface MerchantPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface MerchantEnvelope<T> {
  data: T
  message?: string
  detail?: string
  success: boolean
  status?: string
}

export type MerchantStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED'
  | 'LOCKED'
  | 'TERMINATED'
export type MerchantType = 'PERSONAL' | 'ENTERPRISE' | 'HOUSEHOLD'

export interface StoredFile {
  id: string
  filename: string
  contentType: string
  sizeBytes: number
  url?: string | null
  urlExpiresAt?: string | null
}

export interface SelectableWallet {
  id: string
  registeredEmail: string
  legalName: string
  taxCode?: string
  businessType: 'ENTERPRISE' | 'HOUSEHOLD'
  legalRepresentativeName?: string
}

export interface CreateMerchantPayload {
  enterpriseWalletId: string
  merchantType?: MerchantType
  name?: string
  mccCode?: string
  businessCategory?: string
  websiteUrl?: string
  productDescription?: string
  supportContact?: string
  contractSignedWithSub?: boolean
  contractStagingId?: string
  logoStagingId?: string
  productImageStagingIds?: string[]
  submitForApproval?: boolean
}

export interface UpdateMerchantPayload
  extends Omit<
    CreateMerchantPayload,
    'enterpriseWalletId' | 'submitForApproval'
  > {
  name: string
  mccCode: string
  removedProductImageIds?: string[]
  adminPassword?: string
}

export interface MerchantSearchParams {
  page: number
  size: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
  code?: string
  name?: string
  status?: MerchantStatus
  taxCode?: string
  activationDateFrom?: string
  activationDateTo?: string
}

export interface ContentMerchant {
  id: string
  name: string
  code: string
  contactEmail?: string
  contactPhone?: string
  status: MerchantStatus
  lockSource?: 'DIRECT' | 'CASCADE'
  enterpriseWalletId?: string
  legalName?: string
  taxCode?: string
  enterpriseWallet?: SelectableWallet
  merchantType?: MerchantType
  mccCode?: string
  businessCategory?: string
  websiteUrl?: string
  productDescription?: string
  supportContact?: string
  contractSignedWithSub?: boolean
  contractFile?: StoredFile
  logoFile?: StoredFile
  productImages?: StoredFile[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  stt?: number
  key?: string
}

export type DataMerchant = MerchantPage<ContentMerchant>

export interface TerminationAffectedUser {
  id: string
  email: string
  leftWithoutScope: boolean
}

export interface TerminationResult {
  merchant?: ContentMerchant
  subMerchantsClosed: number
  terminalsClosed: number
  credentialsRevoked: number
  escrowRefundNote?: string
  usersScopeShrunk: number
  usersLeftWithoutScope: number
  affectedUsers: TerminationAffectedUser[]
}

export type MerchantRejectionReasonCode =
  | 'BLURRED_IMAGE'
  | 'INCORRECT_INFORMATION'
  | 'MISSING_DOCUMENT'
  | 'OTHER'

/** GET /merchants/rejection-reasons — danh mục lý do mẫu do BE cấp. */
export interface MerchantRejectionReason {
  code: MerchantRejectionReasonCode
  label: string
  defaultNote: string
}

/** Body POST /merchants/{id}/reject: chỉ nhận `reasonCode` và `detail`. */
export interface RejectMerchantBody {
  reasonCode?: MerchantRejectionReasonCode
  detail: string
}

export interface MerchantHistoryParams {
  id: string
  page: number
  size: number
}

export interface MerchantStatusHistoryItem {
  auditLogId: string
  fromStatus: MerchantStatus | null
  toStatus: MerchantStatus | null
  reason: string | null
  rejectedReasonCode: MerchantRejectionReasonCode | null
  rejectedReasonDetail: string | null
  actorType: string | null
  actorId: string | null
  actorUsername: string | null
  ipAddress: string | null
  occurredAt: string
}

export type MerchantAuditLogAction =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'LOCK'
  | 'UNLOCK'
  | 'TERMINATE'
  | 'VIEW_DOCUMENT'
  | 'RESET_PASSWORD'
  | 'GRANT_PERMISSION'
  | 'EXPORT'

export interface MerchantAuditLog {
  id: string
  entityName: string
  entityId: string
  action: MerchantAuditLogAction
  actorType: string | null
  actorId: string | null
  actorUsername: string | null
  source: string | null
  ipAddress: string | null
  requestId: string | null
  reason: string | null
  /** Chuỗi JSON thô. */
  oldData: string | null
  newData: string | null
  occurredAt: string
}

/** GET /merchants/{id}/termination-obligations; `amount` là VND với SUB_*, là số lượng với mã còn lại. */
export interface TerminationObligation {
  code: string
  subMerchantId: string | null
  subCode: string | null
  amount: number
  message: string
  guidance: string
}
