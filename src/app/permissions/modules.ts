/** Mã quyền do BE cấp có dạng EWALLET:<MODULE>:<ACTION>. */
export const MODULE = {
  ADMIN: 'ADMIN',
  PERMISSION: 'PERMISSION',
  ROLE: 'ROLE',
  USER: 'USER',
  FEE: 'FEE',
  WALLET: 'WALLET',
  TRANSACTION: 'TRANSACTION',
  MERCHANT: 'MERCHANT'
} as const

export type Module = (typeof MODULE)[keyof typeof MODULE]

export const ACTION = {
  VIEW: 'VIEW',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  FULL: 'FULL'
} as const

export type Action = (typeof ACTION)[keyof typeof ACTION]

export type PermissionCode = `EWALLET:${Module}:${Action}`

export const SUPER_ADMIN_PERMISSION =
  'EWALLET:ADMIN:FULL' satisfies PermissionCode
