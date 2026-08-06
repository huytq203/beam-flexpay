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

/**
 * Module ngoài danh sách này tạm thời không bị chặn. Khi BE phát hành quyền,
 * thêm module tại đây sẽ siết quyền cho toàn bộ màn và hành động đã khai báo.
 */
export const RELEASED_MODULES: ReadonlySet<Module> = new Set([
  MODULE.ADMIN,
  MODULE.PERMISSION,
  MODULE.ROLE,
  MODULE.USER
])
