/** Hợp đồng ví doanh nghiệp của Merchant Admin API (`/enterprise-wallets`). */

export const EnterpriseWalletVerificationStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
} as const
export type EnterpriseWalletVerificationStatus =
  (typeof EnterpriseWalletVerificationStatus)[keyof typeof EnterpriseWalletVerificationStatus]

export const EnterpriseWalletBankLinkStatus = {
  BANK_LINKED: 'BANK_LINKED',
  BANK_UNLINKED: 'BANK_UNLINKED'
} as const
export type EnterpriseWalletBankLinkStatus =
  (typeof EnterpriseWalletBankLinkStatus)[keyof typeof EnterpriseWalletBankLinkStatus]

export const EnterpriseBusinessType = {
  ENTERPRISE: 'ENTERPRISE',
  HOUSEHOLD: 'HOUSEHOLD'
} as const
export type EnterpriseBusinessType =
  (typeof EnterpriseBusinessType)[keyof typeof EnterpriseBusinessType]

/** Giấy tờ đã lưu; `url` là link S3 ký sẵn, chỉ dùng được trước `urlExpiresAt`. */
export interface EnterpriseWalletDocument {
  id?: string
  filename?: string
  contentType?: string
  sizeBytes?: number
  checksum?: string
  url?: string | null
  urlExpiresAt?: string | null
}

export interface EnterpriseWalletDto {
  id: string
  registeredEmail: string
  verificationStatus: EnterpriseWalletVerificationStatus
  bankLinkStatus?: EnterpriseWalletBankLinkStatus
  legalName?: string
  taxCode?: string
  businessType?: EnterpriseBusinessType
  headOfficeAddress?: string
  legalRepresentativeName?: string
  legalRepresentativeIdNumber?: string
  managerName?: string
  managerTitle?: string
  managerIdNumber?: string
  /** Ngày hết hạn CCCD người quản lý ví, dạng `YYYY-MM-DD`. */
  managerIdExpiryDate?: string
  otpPhone?: string | null
  businessLicense?: EnterpriseWalletDocument | null
  idCardFront?: EnterpriseWalletDocument | null
  idCardBack?: EnterpriseWalletDocument | null
  authorizationLetter?: EnterpriseWalletDocument | null
  internalWallet?: boolean
  kybRejectedReason?: string | null
  kybRejectedAt?: string | null
  kybRejectedBy?: string | null
  createdAt?: string
  updatedAt?: string
}
