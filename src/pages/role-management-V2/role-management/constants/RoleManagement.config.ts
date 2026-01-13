// Module mappings (first part: EWALLET, ADMIN, etc.)
export const ModuleNames: Record<string, string> = {
    EWALLET: 'Ví',
    ADMIN: 'Quản trị',
    // Add more modules as needed
}

// Resource mappings (second part: FEE, USER, WALLET, etc.)
export const ResourceNames: Record<string, string> = {
    FEE: 'Phí',
    USER: 'Người dùng',
    WALLET: 'Ví',
    TRANSACTION: 'Giao dịch',
    ROLE: 'Vai trò',
    PERMISSION: 'Quyền',
    // Add more resources as needed
}

// Action mappings (third part: DELETE, CREATE, UPDATE, VIEW, etc.)
export const ActionNames: Record<string, string> = {
    DELETE: 'Xóa',
    CREATE: 'Tạo',
    UPDATE: 'Cập nhật',
    VIEW: 'Xem',
    LIST: 'Danh sách',
    EXPORT: 'Xuất',
    IMPORT: 'Nhập',
    APPROVE: 'Duyệt',
    REJECT: 'Từ chối',
    LOCK: 'Khóa',
    UNLOCK: 'Mở khóa',
    ADD: 'Thêm',
    FULL: 'Tất cả với',
    // Add more actions as needed
}

/**
 * Translates a permission code like "EWALLET:FEE:DELETE" to Vietnamese
 * Format: "Quyền {action} {resource}"
 * Example: "EWALLET:FEE:DELETE" → "Quyền xóa phí"
 */
export const translatePermissionName = (permissionCode: string): string => {
    if (!permissionCode) return '--'

    const parts = permissionCode.split(':')

    if (parts.length < 3) return permissionCode // Return original if format is unexpected

    const [, resource, action] = parts // module is parts[0], but we don't use it in the display name

    const actionName = ActionNames[action]?.toLowerCase() || action.toLowerCase()
    const resourceName = ResourceNames[resource]?.toLowerCase() || resource.toLowerCase()

    return `Quyền ${actionName} ${resourceName}`
}