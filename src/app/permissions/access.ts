import {
  ACTION,
  SUPER_ADMIN_PERMISSION,
  type Action,
  type Module,
  type PermissionCode
} from './modules'

export const buildPermissionCode = (
  module: Module,
  action: Action
): PermissionCode => `EWALLET:${module}:${action}`

const MODULE_ACCESS_ACTIONS = [
  ACTION.VIEW,
  ACTION.CREATE,
  ACTION.UPDATE,
  ACTION.DELETE,
  ACTION.FULL
] as const

const getPermissionModule = (code: PermissionCode): Module => {
  // PermissionCode bảo đảm phần tử thứ hai luôn thuộc union Module.
  return code.split(':')[1] as Module
}

/** So khớp chính xác theo thứ tự ưu tiên đã chốt trong đặc tả. */
export const grants = (
  granted: readonly string[],
  required: PermissionCode
): boolean => {
  if (granted.includes(SUPER_ADMIN_PERMISSION)) return true

  const module = getPermissionModule(required)
  const fullPermission = buildPermissionCode(module, ACTION.FULL)
  if (granted.includes(fullPermission)) return true

  return granted.includes(required)
}

/** Có bất kỳ action chuẩn nào của module thì được mở screen thuộc module đó. */
export const grantsModuleAccess = (
  granted: readonly string[],
  module: Module
): boolean =>
  MODULE_ACCESS_ACTIONS.some((action) =>
    grants(granted, buildPermissionCode(module, action))
  )
