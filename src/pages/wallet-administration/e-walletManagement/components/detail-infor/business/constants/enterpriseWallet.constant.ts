import {
  EnterpriseBusinessType,
  EnterpriseWalletVerificationStatus
} from '@type/enterpriseWallet'

export const BUSINESS_TYPE_LABEL: Record<EnterpriseBusinessType, string> = {
  [EnterpriseBusinessType.ENTERPRISE]: 'Doanh nghiệp',
  [EnterpriseBusinessType.HOUSEHOLD]: 'Hộ kinh doanh'
}

export const VERIFICATION_STATUS_LABEL: Record<
  EnterpriseWalletVerificationStatus,
  string
> = {
  [EnterpriseWalletVerificationStatus.DRAFT]: 'Bản nháp',
  [EnterpriseWalletVerificationStatus.PENDING_APPROVAL]: 'Chờ duyệt',
  [EnterpriseWalletVerificationStatus.VERIFIED]: 'Đã xác minh',
  [EnterpriseWalletVerificationStatus.REJECTED]: 'Từ chối'
}
