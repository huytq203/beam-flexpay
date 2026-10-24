import { ADMIN_ROLES } from '../constants/rolePermissionMatrix.constants'
import type { AdminRole } from '../types/rolePermissionMatrix.types'

/** Claim `roles` có thể kèm tiền tố `ROLE_`; chỉ giữ giá trị trùng 7 vai trò nội bộ. */
export const toCallerRoles = (claimRoles: readonly string[]): AdminRole[] =>
  claimRoles
    .map((role) => role.replace(/^ROLE_/i, '').toUpperCase())
    .filter((role): role is AdminRole =>
      (ADMIN_ROLES as string[]).includes(role)
    )

/** Chỉ Super Admin được sửa cột `SUPER_ADMIN`; các cột khác ai có quyền MANAGE cũng sửa được. */
export const canEditRole = (
  role: AdminRole,
  callerRoles: AdminRole[]
): boolean => role !== 'SUPER_ADMIN' || callerRoles.includes('SUPER_ADMIN')

export type SelfLockoutRisk = 'own-role' | 'unknown' | 'none'

/**
 * Đánh giá nguy cơ tự khóa khi gỡ dòng quản trị ma trận: Super Admin không bao giờ bị chặn;
 * nếu biết vai trò người gọi thì chỉ cảnh báo khi họ đang giữ đúng vai trò đang sửa;
 * không xác định được vai trò thì cảnh báo chung.
 */
export const selfLockoutRisk = (
  role: AdminRole,
  callerRoles: AdminRole[]
): SelfLockoutRisk => {
  if (callerRoles.includes('SUPER_ADMIN')) return 'none'
  if (callerRoles.length === 0) return 'unknown'
  return callerRoles.includes(role) ? 'own-role' : 'none'
}
