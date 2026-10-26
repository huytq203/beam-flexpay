export enum StatusKey {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  // FROZEN = 'FROZEN',
  LOCKED = 'LOCKED',
}

export const StatusLabel: Record<StatusKey, string> = {
  [StatusKey.ACTIVE]: 'Hoạt động',
  [StatusKey.INACTIVE]: 'Ngừng hoạt động',
  // [StatusKey.FROZEN]: 'Đóng băng',
  [StatusKey.LOCKED]: 'Khóa',
} as const


export enum StatusAccountKey {
  TRUE = 'true',
  FALSE = 'false',
}

export const StatusAccountLabel: Record<StatusAccountKey, string> = {
  [StatusAccountKey.TRUE]: 'Đang hoạt động',
  [StatusAccountKey.FALSE]: 'Ngừng hoạt động',
} as const

export enum WalletTypeKey {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ENTERPRISE = 'ENTERPRISE',
  SYSTEM = 'SYSTEM',
}

export const WalletTypeLabel: Record<WalletTypeKey, string> = {
  [WalletTypeKey.USER]: 'Cá nhân',
  [WalletTypeKey.MERCHANT]: 'Thu hộ merchant',
  [WalletTypeKey.ENTERPRISE]: 'Doanh nghiệp',
  [WalletTypeKey.SYSTEM]: 'Hệ thống',
} as const
