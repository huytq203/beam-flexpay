import { ReactNode } from 'react'
import { usePermissionCheck } from '@hooks/usePermissionCheck'

interface PermissionWrapperProps {
    /** Permission cần có để hiển thị children (e.g., 'ROLE:DELETE') */
    permission?: string
    /** Danh sách permissions - chỉ cần có 1 trong số này */
    anyPermissions?: string[]
    /** Danh sách permissions - cần có tất cả */
    allPermissions?: string[]
    /** Content sẽ render khi có permission */
    children: ReactNode
    /** Content render khi không có permission (mặc định: null - ẩn hoàn toàn) */
    fallback?: ReactNode
}

/**
 * Component wrapper để kiểm tra permission trước khi render children
 * 
 * @example
 * // Kiểm tra 1 permission
 * <PermissionWrapper permission="ROLE:DELETE">
 *   <ButtonComponent icon={<DeleteOutlined />} />
 * </PermissionWrapper>
 * 
 * @example
 * // Kiểm tra có ít nhất 1 trong các permissions
 * <PermissionWrapper anyPermissions={['ROLE:UPDATE', 'ROLE:FULL']}>
 *   <ButtonComponent icon={<EditOutlined />} />
 * </PermissionWrapper>
 */
export const PermissionWrapper = ({
    permission,
    anyPermissions,
    allPermissions,
    children,
    fallback = null
}: PermissionWrapperProps) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissionCheck()

    let hasAccess = true

    if (permission) {
        hasAccess = hasPermission(permission)
    } else if (anyPermissions && anyPermissions.length > 0) {
        hasAccess = hasAnyPermission(anyPermissions)
    } else if (allPermissions && allPermissions.length > 0) {
        hasAccess = hasAllPermissions(allPermissions)
    }

    if (!hasAccess) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

export default PermissionWrapper
