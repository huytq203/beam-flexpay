import { SUPER_ADMIN_PERMISSION, type PermissionCode } from './permission-codes'
import type { ScreenAccess } from './registry'

/**
 * Khớp tuyệt đối chuỗi mã quyền. Không ghép tiền tố, không suy diễn theo module:
 * quyền BE cấp thế nào thì so khớp đúng thế. Ngoại lệ duy nhất là super-admin.
 */
export const grants = (
  granted: readonly string[],
  required: PermissionCode
): boolean =>
  granted.includes(SUPER_ADMIN_PERMISSION) || granted.includes(required)

export const grantsAny = (
  granted: readonly string[],
  required: readonly PermissionCode[]
): boolean => required.some((code) => grants(granted, code))

/**
 * Một hành động được mở khi có đúng mã của nó, hoặc có mã toàn quyền mà chính
 * màn đó khai ở `actions.full`. Cả hai đều là chuỗi khai sẵn, không phải chuỗi ghép.
 */
export const grantsScreenAction = (
  granted: readonly string[],
  screen: ScreenAccess,
  action: string
): boolean => {
  const required = screen.actions[action]
  if (required === undefined) return false
  if (grants(granted, required)) return true

  const full = screen.actions.full
  if (full !== undefined && grants(granted, full)) return true
  return grantsAny(granted, screen.extraFull ?? [])
}

/** Dùng cùng một luật cho route, sidebar và canView của screen. */
export const grantsScreenAccess = (
  granted: readonly string[],
  screen: ScreenAccess
): boolean =>
  screen.accessPermission !== undefined
    ? grants(granted, screen.accessPermission)
    : grantsAny(granted, [
        ...Object.values(screen.actions),
        ...(screen.extraFull ?? [])
      ])
