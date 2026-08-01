export const ResourceNames: Record<string, string> = {
  FEE: 'phí',
  USER: 'người dùng',
  WALLET: 'ví',
  TRANSACTION: 'giao dịch',
  ROLE: 'nhóm quyền hạn',
  PERMISSION: 'quyền hạn',
  ACCOUNT: 'tài khoản',
};

export const ActionNames: Record<string, string> = {
  DELETE: 'Xóa',
  EDIT: 'Sửa',
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  VIEW: 'Xem chi tiết',
  LIST: 'Xem danh sách',
  EXPORT: 'Xuất dữ liệu',
  IMPORT: 'Nhập dữ liệu',
  APPROVE: 'Duyệt',
  REJECT: 'Từ chối',
  LOCK: 'Khóa',
  UNLOCK: 'Mở khóa',
  ADD: 'Thêm',
  FULL: 'Toàn quyền'
};

export const translatePermissionName = (permissionCode?: string): string => {
  if (!permissionCode) return '--'

  const parts = permissionCode.split(':')
  if (parts.length < 2) return permissionCode

  const action = parts.at(-1) ?? ''
  const resource = parts.at(-2) ?? ''
  const actionName = ActionNames[action] ?? action.toLowerCase()
  const resourceName = ResourceNames[resource] ?? resource.toLowerCase()

  return `${actionName} ${resourceName}`
}
