import type {
  BankAccountChangeType,
  BankAccountDto
} from '@/app/services/merchantBankAccountApi'

export const LEVEL_OPTIONS: {
  label: string
  value: BankAccountDto['level']
}[] = [
  { label: 'Master', value: 'MASTER' },
  { label: 'Sub-merchant', value: 'SUB' },
  { label: 'Terminal', value: 'TERMINAL' },
  { label: 'Mặc định hệ thống', value: 'SYSTEM_DEFAULT' }
]

export const STATUS_OPTIONS: {
  label: string
  value: BankAccountDto['status']
}[] = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Không hoạt động', value: 'INACTIVE' },
  { label: 'Đã xác minh', value: 'VERIFIED' }
]

export const LINK_STATUS: Record<
  BankAccountDto['linkStatus'],
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  LINKED: { label: 'Đã liên kết', color: 'success' },
  LINK_FAILED: { label: 'Lỗi liên kết', color: 'error' },
  PENDING_VERIFICATION: { label: 'Chờ xác minh', color: 'warning' }
}

export const CHANGE_TYPE_LABEL: Record<BankAccountChangeType, string> = {
  UPDATE_ACCOUNT: 'Đổi thông tin tài khoản',
  SET_DEFAULT: 'Đặt làm tài khoản mặc định'
}

// BE từ chối lý do tạm giữ ngắn hơn 10 ký tự (MIN_HOLD_REASON_LENGTH).
export const MIN_HOLD_REASON_LENGTH = 10

export const levelLabel = (level: BankAccountDto['level']): string =>
  LEVEL_OPTIONS.find((option) => option.value === level)?.label ?? level

export const BANK_ACCOUNT_FILTER_KEYS = [
  'query',
  'merchantId',
  'merchantCode',
  'merchantName',
  'level',
  'status'
] as const
export type BankAccountFilterKey = (typeof BANK_ACCOUNT_FILTER_KEYS)[number]
// Ô từ khóa gợi ý nhập số tài khoản nên không được lên URL.
export const BANK_ACCOUNT_SENSITIVE_KEYS: readonly BankAccountFilterKey[] = [
  'query'
]
