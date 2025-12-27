import { useAppSelector } from './hook'
import { useCallback, useMemo } from 'react'
import { RootState } from '../store'

/**
 * Hook để kiểm tra quyền cụ thể của user hiện tại
 * Permissions được lấy từ JWT token và lưu trong Redux state
 * 
 * Format permission từ API: 'EWALLET:ROLE:DELETE', 'EWALLET:FEE:FULL'
 * 
 * NOTE: Khác với usePermission (route-based), hook này check specific permissions
 */
export const usePermissionCheck = () => {
    const { permissions } = useAppSelector((state: RootState) => state.auth.profile)

    /**
     * Lấy module từ permission (ROLE từ EWALLET:ROLE:DELETE)
     */
    const getModule = useCallback((permission: string): string => {
        const parts = permission.split(':')
        // Format: EWALLET:MODULE:ACTION
        if (parts.length === 3 && parts[0] === 'EWALLET') {
            return parts[1]
        }
        // Fallback nếu format khác
        return parts[0]
    }, [])

    /**
     * Kiểm tra user có permission cụ thể không
     * @param permission - Permission cần kiểm tra (e.g., 'EWALLET:ROLE:DELETE')
     * @returns true nếu có quyền
     */
    const hasPermission = useCallback(
        (permission: string): boolean => {
            if (!permissions || permissions.length === 0) return false

            // Admin có tất cả quyền
            if (permissions.includes('admin*')) return true

            const module = getModule(permission)
            const fullPermission = `EWALLET:${module}:FULL`

            // Check FULL permission (e.g., EWALLET:ROLE:FULL cho phép EWALLET:ROLE:DELETE)
            if (permissions.includes(fullPermission)) {
                return true
            }

            // Check exact match
            return permissions.includes(permission)
        },
        [permissions, getModule]
    )

    /**
     * Kiểm tra user có ít nhất một trong các permissions
     * @param perms - Danh sách permissions cần kiểm tra
     */
    const hasAnyPermission = useCallback(
        (perms: string[]): boolean => {
            return perms.some((perm) => hasPermission(perm))
        },
        [hasPermission]
    )

    /**
     * Kiểm tra user có tất cả permissions
     * @param perms - Danh sách permissions cần kiểm tra
     */
    const hasAllPermissions = useCallback(
        (perms: string[]): boolean => {
            return perms.every((perm) => hasPermission(perm))
        },
        [hasPermission]
    )

    /**
     * Lấy danh sách roles của user từ permissions
     */
    const userRoles = useMemo(() => {
        return permissions.filter((p: string) => !p.includes(':'))
    }, [permissions])

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        userRoles
    }
}

export default usePermissionCheck
