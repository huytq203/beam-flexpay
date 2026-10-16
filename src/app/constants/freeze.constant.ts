/**
 * Từ điển trạng thái của nghiệp vụ đóng băng số dư, dùng chung cho cả ba màn đang gọi
 * `/wallet/freezes`: Giao dịch đóng băng, tab Số dư đóng băng của ví cá nhân và ví doanh nghiệp.
 * Trước đây mỗi màn tự giữ một bảng nhãn riêng nên cùng một trạng thái hiện ra ba kiểu khác nhau.
 */

/** Trạng thái hiển thị do wallet-core suy ra (`deriveFreezeDisplayStatus`), không phải cột DB. */
export const FreezeDisplayStatus = {
  FROZEN: 'FROZEN',
  PARTIALLY_RELEASED: 'PARTIALLY_RELEASED',
  RELEASED: 'RELEASED',
  CAPTURED: 'CAPTURED',
  PARTIALLY_CAPTURED: 'PARTIALLY_CAPTURED',
  EXPIRED: 'EXPIRED'
} as const

export type FreezeDisplayStatus =
  (typeof FreezeDisplayStatus)[keyof typeof FreezeDisplayStatus]

/** Trạng thái lệnh mở băng; giữ PENDING_APPROVAL/REJECTED để đọc dữ liệu lịch sử cũ. */
export const UnfreezeCommandStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  EXECUTED: 'EXECUTED',
  REJECTED: 'REJECTED'
} as const

export type UnfreezeCommandStatus =
  (typeof UnfreezeCommandStatus)[keyof typeof UnfreezeCommandStatus]

export type FreezeBadgeKey = FreezeDisplayStatus

interface FreezeBadgeConfig {
  label: string
  className: string
  shimmerColor?: string
}

export const FREEZE_STATUS_CONFIG: Record<FreezeBadgeKey, FreezeBadgeConfig> = {
  [FreezeDisplayStatus.FROZEN]: {
    label: 'Đang đóng băng',
    className: 'info-status'
  },
  [FreezeDisplayStatus.PARTIALLY_RELEASED]: {
    label: 'Giải tỏa một phần',
    className: 'info-status'
  },
  [FreezeDisplayStatus.RELEASED]: {
    label: 'Đã mở băng',
    className: 'success-status'
  },
  [FreezeDisplayStatus.CAPTURED]: {
    label: 'Đã thu',
    className: 'normal-status'
  },
  [FreezeDisplayStatus.PARTIALLY_CAPTURED]: {
    label: 'Đã thu một phần',
    className: 'normal-status'
  },
  [FreezeDisplayStatus.EXPIRED]: {
    label: 'Hết hạn',
    className: 'normal-status'
  }
}

/** Trạng thái gốc trong DB của bản ghi đóng băng. */
export const FreezeStatus = {
  ACTIVE: 'ACTIVE',
  CAPTURED: 'CAPTURED',
  PARTIALLY_CAPTURED: 'PARTIALLY_CAPTURED',
  RELEASED: 'RELEASED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
} as const

export type FreezeStatus = (typeof FreezeStatus)[keyof typeof FreezeStatus]

/** Lý do khoản tiền bị giữ. */
export const FreezeType = {
  ADMIN_LOCK: 'ADMIN_LOCK',
  PAYMENT: 'PAYMENT',
  COMPLIANCE_FREEZE: 'COMPLIANCE_FREEZE'
} as const

export type FreezeType = (typeof FreezeType)[keyof typeof FreezeType]

export const FREEZE_TYPE_LABEL: Record<FreezeType, string> = {
  [FreezeType.ADMIN_LOCK]: 'Đóng băng bởi Admin',
  [FreezeType.PAYMENT]: 'Hệ thống hold thanh toán',
  [FreezeType.COMPLIANCE_FREEZE]: 'Tuân thủ pháp luật'
}

/** Cách khoản tiền rời hold, chỉ có giá trị sau khi Đã mở băng. */
export const ReleaseType = {
  MANUAL: 'MANUAL',
  EXPIRED: 'EXPIRED',
  CAPTURED: 'CAPTURED'
} as const

export type ReleaseType = (typeof ReleaseType)[keyof typeof ReleaseType]

export const RELEASE_TYPE_LABEL: Record<ReleaseType, string> = {
  [ReleaseType.MANUAL]: 'Admin mở thủ công',
  [ReleaseType.EXPIRED]: 'Hết hạn tự mở',
  [ReleaseType.CAPTURED]: 'Hệ thống thu'
}

export const OwnerType = {
  USER: 'USER',
  MERCHANT: 'MERCHANT',
  SYSTEM: 'SYSTEM'
} as const

export type OwnerType = (typeof OwnerType)[keyof typeof OwnerType]

export const OWNER_TYPE_CONFIG: Record<
  OwnerType,
  { label: string; className: string }
> = {
  [OwnerType.USER]: { label: 'User', className: 'normal-status' },
  [OwnerType.MERCHANT]: { label: 'Merchant', className: 'normal-status' },
  [OwnerType.SYSTEM]: { label: 'System', className: 'normal-status' }
}
