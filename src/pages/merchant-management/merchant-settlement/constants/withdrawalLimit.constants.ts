import type { LimitApproval, LimitLevel } from '../types/withdrawalLimit.types'

export const LEVEL_LABEL: Record<LimitLevel, string> = {
  SYSTEM: 'Mặc định hệ thống',
  MASTER: 'Master merchant',
  SUB: 'Sub-merchant'
}

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABEL).map(
  ([value, label]) => ({ value, label })
)

export const APPROVAL_LABEL: Record<
  LimitApproval,
  { label: string; color: 'warning' | 'success' | 'error' | 'default' }
> = {
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'warning' },
  APPROVED: { label: 'Đang áp dụng', color: 'success' },
  REJECTED: { label: 'Đã từ chối', color: 'error' },
  INACTIVE: { label: 'Đã gỡ', color: 'default' }
}

export const LIMIT_FIELD_LABEL = {
  minimumWithdrawalAmount: 'Mức rút tối thiểu',
  maximumWithdrawalAmount: 'Mức rút tối đa',
  dailyWithdrawalLimit: 'Hạn mức rút trong ngày',
  autoApprovalThreshold: 'Ngưỡng tự duyệt',
  maximumDailyWithdrawalCount: 'Số lệnh rút tối đa mỗi ngày'
} as const
