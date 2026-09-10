/**
 * Bảng tra trạng thái cho màn "Thông tin chung" của ví cá nhân.
 * className bám theo bộ tông dùng chung ở `src/styles/_status.css`
 * (success / danger / warning / info / normal) — không tự chế mã màu.
 */
import { StatusKey, StatusLabel } from '@pages/wallet-administration/e-walletManagement/constants/Ewallet.constant'

export interface StatusDisplayConfig {
  label: string
  className: string
}

/**
 * Trạng thái ví. Không khai báo shimmerColor: bảng thông tin tĩnh không cần
 * hiệu ứng chạy, chỉ bảng danh sách mới dùng.
 */
export const WALLET_STATUS_CONFIG: Record<StatusKey, StatusDisplayConfig> = {
  [StatusKey.ACTIVE]: { label: StatusLabel[StatusKey.ACTIVE], className: 'success-status' },
  [StatusKey.INACTIVE]: { label: StatusLabel[StatusKey.INACTIVE], className: 'normal-status' },
  [StatusKey.FROZEN]: { label: StatusLabel[StatusKey.FROZEN], className: 'info-status' },
  [StatusKey.LOCKED]: { label: StatusLabel[StatusKey.LOCKED], className: 'danger-status' },
} as const

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const GenderLabel: Record<GenderEnum, string> = {
  [GenderEnum.MALE]: 'Nam',
  [GenderEnum.FEMALE]: 'Nữ',
  [GenderEnum.OTHER]: 'Khác',
} as const

export enum EkycStatusEnum {
  VERIFIED = 'VERIFIED',
  INVALID = 'INVALID',
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED',
  /** Giá trị nội bộ khi hồ sơ eKYC chưa tồn tại, không phải giá trị của backend. */
  NOT_VERIFIED = 'NOT_VERIFIED',
}

export const EKYC_STATUS_CONFIG: Record<EkycStatusEnum, StatusDisplayConfig> = {
  [EkycStatusEnum.VERIFIED]: { label: 'Đã xác thực', className: 'success-status' },
  [EkycStatusEnum.INVALID]: { label: 'Không hợp lệ', className: 'danger-status' },
  [EkycStatusEnum.INITIATED]: { label: 'Đã khởi tạo', className: 'info-status' },
  [EkycStatusEnum.IN_PROGRESS]: { label: 'Đang xử lý', className: 'info-status' },
  [EkycStatusEnum.COMPLETED]: { label: 'Đã hoàn tất', className: 'success-status' },
  [EkycStatusEnum.FAILED]: { label: 'Thất bại', className: 'danger-status' },
  [EkycStatusEnum.EXPIRED]: { label: 'Đã hết hạn', className: 'warning-status' },
  [EkycStatusEnum.ABANDONED]: { label: 'Đã bỏ dở', className: 'normal-status' },
  [EkycStatusEnum.NOT_VERIFIED]: { label: 'Chưa xác thực', className: 'normal-status' },
} as const

export enum BankLinkStateEnum {
  LINKED = 'LINKED',
  NOT_LINKED = 'NOT_LINKED',
}

export const BANK_LINK_STATE_CONFIG: Record<BankLinkStateEnum, StatusDisplayConfig> = {
  [BankLinkStateEnum.LINKED]: { label: 'Đã liên kết', className: 'success-status' },
  [BankLinkStateEnum.NOT_LINKED]: { label: 'Chưa liên kết', className: 'normal-status' },
} as const

export enum SalaryAdvanceStateEnum {
  ENABLED = 'ENABLED',
  NOT_LINKED = 'NOT_LINKED',
}

export const SALARY_ADVANCE_STATE_CONFIG: Record<SalaryAdvanceStateEnum, StatusDisplayConfig> = {
  [SalaryAdvanceStateEnum.ENABLED]: { label: 'Đang bật', className: 'success-status' },
  [SalaryAdvanceStateEnum.NOT_LINKED]: { label: 'Chưa liên kết', className: 'normal-status' },
} as const

/** Ngưỡng điểm khớp khuôn mặt do nghiệp vụ eKYC quy định. */
export const FACE_MATCH_THRESHOLD = {
  GOOD: 80,
  FAIR: 60,
} as const

export const EKYC_DOCUMENT_SLOTS = [
  { key: 'FRONT', boxLabel: 'Mặt trước', caption: 'CCCD Trước' },
  { key: 'BACK', boxLabel: 'Mặt sau', caption: 'CCCD Sau' },
  { key: 'PORTRAIT', boxLabel: 'Chân dung', caption: 'Face Match' },
] as const
