export enum StatusKey {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FROZEN = 'FROZEN',
}

export const StatusLabel: Record<StatusKey, string> = {
  [StatusKey.ACTIVE]: 'Hoạt động',
  [StatusKey.INACTIVE]: 'Ngừng hoạt động',
  [StatusKey.FROZEN]: 'Đóng băng',
} as const
