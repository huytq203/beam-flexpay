import type { BankAccountChangeRequestStatus } from '@/app/services/merchantBankAccountApi'

export const CHANGE_REQUEST_FILTER_KEYS = ['status'] as const
export type ChangeRequestFilterKey = (typeof CHANGE_REQUEST_FILTER_KEYS)[number]

/** Bỏ trống `status` thì BE trả PENDING, nên FE hiển thị và gửi PENDING rõ ràng. */
export const DEFAULT_CHANGE_REQUEST_STATUS: BankAccountChangeRequestStatus =
  'PENDING'

export const CHANGE_REQUEST_STATUS_OPTIONS: {
  label: string
  value: BankAccountChangeRequestStatus
}[] = [
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đã duyệt', value: 'APPROVED' },
  { label: 'Đã từ chối', value: 'REJECTED' }
]

export const CHANGE_REQUEST_STATUS_COLOR: Record<
  BankAccountChangeRequestStatus,
  'warning' | 'success' | 'error'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error'
}

export const CHANGE_REQUEST_PAGE_SIZE = 20
