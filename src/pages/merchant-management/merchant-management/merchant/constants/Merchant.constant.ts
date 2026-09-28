import type { MerchantStatus as MerchantStatusType } from '@type/merchant'

export const STATUS_CONFIG: Record<MerchantStatusType, { label: string; className: string; shimmerColor: string }> = {
  DRAFT: { label: 'Nháp', className: 'neutral-status', shimmerColor: 'rgba(100, 116, 139, 0.2)' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', className: 'warning-status', shimmerColor: 'rgba(245, 158, 11, 0.2)' },
  ACTIVE: { label: 'Hoạt động', className: 'success-status', shimmerColor: 'rgba(0, 229, 160, 0.2)' },
  REJECTED: { label: 'Từ chối', className: 'danger-status', shimmerColor: 'rgba(239, 68, 68, 0.2)' },
  LOCKED: { label: 'Bị khóa', className: 'danger-status', shimmerColor: 'rgba(239, 68, 68, 0.2)' },
  TERMINATED: { label: 'Đã kết thúc', className: 'neutral-status', shimmerColor: 'rgba(100, 116, 139, 0.2)' }
}
