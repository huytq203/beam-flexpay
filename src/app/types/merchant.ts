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

export type MerchantStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'LOCKED' | 'TERMINATED'
export type MerchantType = 'PERSONAL' | 'ENTERPRISE' | 'HOUSEHOLD'

export interface StoredFile {
  id: string
  filename: string
  contentType: string
  sizeBytes: number
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

export interface UpdateMerchantPayload extends Omit<CreateMerchantPayload, 'enterpriseWalletId' | 'submitForApproval'> {
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
