export enum StatusKey {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  CLOSED = 'CLOSED',

  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  CAPTURED = 'CAPTURED',
  RELEASED = 'RELEASED',
  EXPIRED = 'EXPIRED'
}

export const StatusLabel: Record<StatusKey, string> = {
  [StatusKey.ACTIVE]: 'Hoạt động',
  [StatusKey.INACTIVE]: 'Ngừng hoạt động',
  [StatusKey.FROZEN]: 'Đóng băng',
  [StatusKey.LOCKED]: 'Khóa',
  [StatusKey.CLOSED]: 'Đã hủy',
  [StatusKey.SUCCESS]: 'Thành công',
  [StatusKey.FAILED]: 'Thất bại',
  [StatusKey.PENDING]: 'Chờ xử lý',
  [StatusKey.CANCELLED]: 'Đã hủy',
  [StatusKey.CAPTURED]: 'Đã thu',
  [StatusKey.RELEASED]: 'Đã mở băng',
  [StatusKey.EXPIRED]: 'Hết hạn'
} as const
