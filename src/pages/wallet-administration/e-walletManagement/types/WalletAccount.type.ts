export enum StatusKey {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

export const StatusLabel: Record<StatusKey, string> = {
  [StatusKey.ACTIVE]: 'Hoạt động',
  [StatusKey.INACTIVE]: 'Ngừng hoạt động',
  [StatusKey.FROZEN]: 'Đóng băng',
  [StatusKey.LOCKED]: 'Khóa'
} as const

export interface dataLockAccount {
  userId: string
  reason: string
}
