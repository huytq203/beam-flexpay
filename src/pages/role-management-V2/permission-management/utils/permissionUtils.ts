/**
 * Permission Management Utilities
 * 
 * Utilities for parsing, grouping and managing permissions from API
 * Permission name format: EWALLET:{TYPE}:{ACTION}
 */

// ============ TYPES ============

export interface PermissionItem {
    id: string | number
    name?: string           // New API format
    permission?: string     // Old API format (fallback)
    description?: string
}

export interface ParsedPermission {
    id: string
    name: string
    description: string
    type: string
    action: string
}

export interface GroupedPermissions {
    [type: string]: ParsedPermission[]
}

// ============ CONSTANTS ============

/**
 * Labels for permission types (Vietnamese)
 * Add new types here when API adds them
 */
export const TYPE_LABELS: Record<string, string> = {
    FEE: 'Quản lý phí',
    ROLE: 'Quản lý quyền hạn',
    USER: 'Quản lý người dùng',
    PERMISSION: 'Quản lý phân quyền',
    // Add more types as needed
}

/**
 * Labels for permission actions (Vietnamese)
 */
export const ACTION_LABELS: Record<string, string> = {
    CREATE: 'Thêm',
    UPDATE: 'Sửa',
    DELETE: 'Xóa',
    VIEW: 'Xem',
    APPROVE: 'Duyệt',
    FULL: 'Tất cả',
}

/**
 * Order of actions in table columns (excluding FULL)
 */
export const ACTION_ORDER: string[] = ['APPROVE', 'VIEW', 'CREATE', 'UPDATE', 'DELETE']

// ============ UTILITY FUNCTIONS ============

/**
 * Get permission name from item (handles both 'name' and 'permission' fields)
 */
export const getPermissionName = (permission: PermissionItem): string => {
    return permission.name || permission.permission || ''
}

/**
 * Parse permission name to extract type and action
 * @param name - Permission name (e.g., "EWALLET:FEE:CREATE")
 * @returns Object with type and action
 */
export const parsePermissionName = (name: string): { type: string; action: string } => {
    const parts = name.split(':')
    return {
        type: parts[1] || '',
        action: parts[2] || ''
    }
}

/**
 * Normalize permission to ParsedPermission
 */
export const normalizePermission = (permission: PermissionItem): ParsedPermission | null => {
    const name = getPermissionName(permission)
    if (!name) return null

    const { type, action } = parsePermissionName(name)
    if (!type || !action) return null

    return {
        id: String(permission.id),
        name,
        description: permission.description || '',
        type,
        action
    }
}

/**
 * Group permissions by their type
 * @param permissions - Array of permissions from API
 * @returns Object with type as key and array of parsed permissions as value
 */
export const groupPermissionsByType = (permissions: PermissionItem[]): GroupedPermissions => {
    const groups: GroupedPermissions = {}

    permissions.forEach(permission => {
        const parsed = normalizePermission(permission)
        if (!parsed) return

        if (!groups[parsed.type]) {
            groups[parsed.type] = []
        }

        groups[parsed.type].push(parsed)
    })

    return groups
}

/**
 * Get permission ID by type and action
 * @param permissions - Array of permissions
 * @param type - Permission type (e.g., "FEE")
 * @param action - Permission action (e.g., "CREATE")
 * @returns Permission ID or undefined
 */
export const getPermissionId = (
    permissions: PermissionItem[],
    type: string,
    action: string
): string | undefined => {
    const permissionName = `EWALLET:${type}:${action}`
    const found = permissions.find(p => getPermissionName(p) === permissionName)
    return found ? String(found.id) : undefined
}

/**
 * Get all available actions for a type (excluding FULL)
 * @param groupedPermissions - Grouped permissions for a type
 * @returns Array of available actions
 */
export const getAvailableActions = (groupedPermissions: ParsedPermission[]): string[] => {
    const actions = groupedPermissions
        .map(p => p.action)
        .filter(action => action !== 'FULL')

    // Sort by ACTION_ORDER
    return ACTION_ORDER.filter(action => actions.includes(action))
}

/**
 * Check if all individual actions are selected (to determine if FULL should be submitted)
 * @param selectedIds - Set of selected permission IDs
 * @param typePermissions - All permissions for a type
 * @returns true if all non-FULL actions are selected
 */
export const isAllActionsSelected = (
    selectedIds: Set<string>,
    typePermissions: ParsedPermission[]
): boolean => {
    const individualActions = typePermissions.filter(p => p.action !== 'FULL')
    return individualActions.length > 0 && individualActions.every(p => selectedIds.has(p.id))
}

/**
 * Get the FULL permission for a type
 * @param typePermissions - All permissions for a type
 * @returns FULL permission or undefined
 */
export const getFullPermission = (typePermissions: ParsedPermission[]): ParsedPermission | undefined => {
    return typePermissions.find(p => p.action === 'FULL')
}

/**
 * Get type label with fallback to type name
 * @param type - Permission type
 * @returns Vietnamese label or type name
 */
export const getTypeLabel = (type: string): string => {
    return TYPE_LABELS[type] || type
}

/**
 * Get action label with fallback to action name
 * @param action - Permission action
 * @returns Vietnamese label or action name
 */
export const getActionLabel = (action: string): string => {
    return ACTION_LABELS[action] || action
}
