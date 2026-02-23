export enum StatusKey {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const StatusLabel: Record<StatusKey, string> = {
  [StatusKey.ACTIVE]: 'Hoạt động',
  [StatusKey.INACTIVE]: 'Ngừng hoạt động',
} as const
