import {
  ACTION,
  RELEASED_MODULES,
  SUPER_ADMIN_PERMISSION,
  type Action,
  type Module,
  type PermissionCode
} from './modules'

export const buildPermissionCode = (
  module: Module,
  action: Action
): PermissionCode => `EWALLET:${module}:${action}`

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
  if (!RELEASED_MODULES.has(module)) return true

  const fullPermission = buildPermissionCode(module, ACTION.FULL)
  if (granted.includes(fullPermission)) return true

  return granted.includes(required)
}
