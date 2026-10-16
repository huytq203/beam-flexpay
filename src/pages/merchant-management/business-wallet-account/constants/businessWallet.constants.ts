import type { BusinessWalletRow } from '../types/business-wallet.type'

interface BadgeConfig {
  label: string
  className: string
  shimmerColor: string
}

const NEUTRAL = 'rgba(100, 116, 139, 0.2)'
const WARNING = 'rgba(245, 158, 11, 0.2)'
const SUCCESS = 'rgba(0, 229, 160, 0.2)'
const DANGER = 'rgba(239, 68, 68, 0.2)'
const INFO = 'rgba(59, 130, 246, 0.2)'

export const VERIFICATION_STATUS_CONFIG: Record<
  BusinessWalletRow['verificationStatus'],
  BadgeConfig
> = {
  DRAFT: {
    label: 'Bản nháp',
    className: 'neutral-status',
    shimmerColor: NEUTRAL
  },
  PENDING_APPROVAL: {
    label: 'Chờ duyệt',
    className: 'warning-status',
    shimmerColor: WARNING
  },
  VERIFIED: {
    label: 'Đã xác minh',
    className: 'success-status',
    shimmerColor: SUCCESS
  },
  REJECTED: {
    label: 'Từ chối',
    className: 'danger-status',
    shimmerColor: DANGER
  }
}

export const BANK_LINK_STATUS_CONFIG: Record<
  NonNullable<BusinessWalletRow['bankLinkStatus']>,
  BadgeConfig
> = {
  BANK_LINKED: {
    label: 'Đã liên kết',
    className: 'success-status',
    shimmerColor: SUCCESS
  },
  BANK_UNLINKED: {
    label: 'Chưa liên kết',
    className: 'neutral-status',
    shimmerColor: NEUTRAL
  }
}

export const BUSINESS_TYPE_CONFIG: Record<
  NonNullable<BusinessWalletRow['businessType']>,
  BadgeConfig
> = {
  ENTERPRISE: {
    label: 'Doanh nghiệp',
    className: 'info-status',
    shimmerColor: INFO
  },
  HOUSEHOLD: {
    label: 'Hộ kinh doanh',
    className: 'normal-status',
    shimmerColor: NEUTRAL
  }
}

export const BUSINESS_WALLET_FILTER_KEYS = [
  'query',
  'taxCode',
  'verificationStatus'
] as const
export type BusinessWalletFilterKey =
  (typeof BUSINESS_WALLET_FILTER_KEYS)[number]
// Ô tìm kiếm gợi ý nhập email doanh nghiệp, còn MST của hộ kinh doanh cá thể
// chính là số CCCD, nên cả hai không được lên URL.
export const BUSINESS_WALLET_SENSITIVE_KEYS: readonly BusinessWalletFilterKey[] =
  ['query', 'taxCode']
