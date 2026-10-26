export enum StatusKey {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  CLOSED = 'CLOSED'
}

export const CONFIG_STATUS: Record<StatusKey, { label: string, className: string, }>  = {
  [StatusKey.ACTIVE]: { label: 'Hoạt động', className: 'success-status'},
  [StatusKey.INACTIVE]: { label: 'Ngừng hoạt động', className: 'error-status'},
  [StatusKey.FROZEN]: { label: 'Đóng băng', className: 'warning-status'},
  [StatusKey.LOCKED]: { label: 'Khóa', className: 'error-status'},
  [StatusKey.CLOSED]: { label: 'Đã hủy', className: 'error-status'},
} as const

export interface dataLockAccount {
  userId: string
  reason: string
}
