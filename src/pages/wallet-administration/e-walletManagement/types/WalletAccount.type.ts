export enum StatusKey {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  INACTIVE = 'INACTIVE',
}

export const StatusLabel: Record<StatusKey, string> = {
  [StatusKey.ACTIVE]: 'Hoạt động',
  [StatusKey.INACTIVE]: 'Ngừng hoạt động',
  [StatusKey.FROZEN]: 'Đóng băng',
} as const
