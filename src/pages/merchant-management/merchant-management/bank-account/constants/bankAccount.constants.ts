import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'

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
