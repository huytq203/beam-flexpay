import { OutboundFeeStatus } from '../types/outbound-fee'

export const OUTBOUND_FEE_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: OutboundFeeStatus.PENDING_APPROVAL, label: 'Chờ duyệt' },
  { value: OutboundFeeStatus.APPROVED, label: 'Chờ áp dụng' },
  { value: OutboundFeeStatus.ACTIVE, label: 'Đang áp dụng' },
  { value: OutboundFeeStatus.REJECTED, label: 'Đã từ chối' },
  { value: OutboundFeeStatus.EXPIRED, label: 'Đã hết hạn' }
]

export const OUTBOUND_FEE_STATUS_COLORS: Record<OutboundFeeStatus, string> = {
  [OutboundFeeStatus.PENDING_APPROVAL]: 'warning',
  [OutboundFeeStatus.APPROVED]: 'processing',
  [OutboundFeeStatus.ACTIVE]: 'success',
  [OutboundFeeStatus.REJECTED]: 'error',
  [OutboundFeeStatus.EXPIRED]: 'default'
}

export const OUTBOUND_FEE_STATUS_LABELS: Record<OutboundFeeStatus, string> = {
  [OutboundFeeStatus.PENDING_APPROVAL]: 'Chờ duyệt',
  [OutboundFeeStatus.APPROVED]: 'Chờ áp dụng',
  [OutboundFeeStatus.ACTIVE]: 'Đang áp dụng',
  [OutboundFeeStatus.REJECTED]: 'Đã từ chối',
  [OutboundFeeStatus.EXPIRED]: 'Đã hết hạn'
}

export const getOutboundFeeStatusColor = (status: OutboundFeeStatus): string => {
  return OUTBOUND_FEE_STATUS_COLORS[status] || 'default'
}

export const getOutboundFeeStatusLabel = (status: OutboundFeeStatus): string => {
  return OUTBOUND_FEE_STATUS_LABELS[status] || status
}
