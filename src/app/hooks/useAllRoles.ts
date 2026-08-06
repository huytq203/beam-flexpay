import { useGetRoleQuery } from '@services/apiRole'
import { RoleDataItem } from '@type/roleManagementV2'

/** Trang đầu dùng để đọc `totalElements`; đa số hệ thống chỉ cần đúng lần gọi này. */
export const ROLE_FIRST_PAGE_SIZE = 100

/** Giữ tham chiếu cố định để `useMemo` phía dùng không chạy lại mỗi lần render. */
const EMPTY_ROLES: RoleDataItem[] = []

export interface UseAllRolesResult {
  roles: RoleDataItem[]
  totalRoles: number
  isLoading: boolean
}

/**
 * Lấy toàn bộ role cho dropdown mà không hardcode một `size` "đủ lớn":
 * gọi trang đầu để biết `totalElements`, chỉ khi tổng vượt trang đầu mới gọi
 * lần hai với đúng số bản ghi. Hardcode size vừa tải thừa, vừa mất role khi
 * dữ liệu vượt ngưỡng đoán.
 */
export const useAllRoles = (): UseAllRolesResult => {
  const { data: firstPage, isLoading: isLoadingFirstPage } = useGetRoleQuery({
    page: 1,
    size: ROLE_FIRST_PAGE_SIZE
  })

  const totalRoles = firstPage?.totalElements ?? 0
  const needsFullFetch = totalRoles > ROLE_FIRST_PAGE_SIZE

  const { data: allRoles, isLoading: isLoadingAllRoles } = useGetRoleQuery(
    { page: 1, size: totalRoles },
    { skip: !needsFullFetch }
  )

  const roleData = needsFullFetch ? allRoles : firstPage

  return {
    roles: roleData?.content ?? EMPTY_ROLES,
    totalRoles,
    isLoading: isLoadingFirstPage || (needsFullFetch && isLoadingAllRoles)
  }
}
