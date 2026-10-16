import { useMemo } from 'react'
import { useGetUserQuery } from '@services/apiUserManagement'
import { useAllRoles } from '@hooks/useAllRoles'
import { UserInfor } from '@type/userManagement'
// import { RoleUserAccount } from '../constants/userAccount'
import { SearchUserFormData } from '../types/UserManagement.type'
import { toUserQueryFilters } from '../utils/UserManagement.utils'
import {
  USER_FILTER_KEYS,
  USER_SENSITIVE_KEYS,
  toSearchUserFormData,
  type UserFilterKey
} from '../utils/userUrlFilters'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { RoleName } from '../../role-management/constants/RoleManagement.constant'

const SORT_BY = 'createdTimestamp'
const SORT_DIRECTION = 'DESC'

const useFetchDataUser = () => {
  const {
    filters,
    applyFilters,
    clearFilters,
    page,
    size,
    setPage,
    setPageSize
  } = useUrlFilters<UserFilterKey>({
    keys: USER_FILTER_KEYS,
    sensitiveKeys: USER_SENSITIVE_KEYS
  })
  const formValues = toSearchUserFormData(filters)
  const params = {
    page,
    size,
    sortBy: SORT_BY,
    sortDirection: SORT_DIRECTION,
    ...toUserQueryFilters(formValues)
  }
  const { data: userData, isLoading: isLoadingUser, refetch } = useGetUserQuery(params)

  const { roles, isLoading: isLoadingRoles } = useAllRoles()

  const dataSource = useMemo(() => {
    return (
      userData?.content?.map((item: UserInfor, index: number) => ({
        ...item,
        no: (page - 1) * size + index + 1
      })) ?? []
    )
  }, [userData?.content, page, size])

  const roleOptions = useMemo(() => {
    return roles.map((role) => ({
      value: role.id,
      label: RoleName[role.name as keyof typeof RoleName] ?? role.name
    }))
  }, [roles])

  // applyFilters tự đưa về trang 1: trang cũ có thể vượt tổng số trang mới.
  const handleSearch = (data: SearchUserFormData) =>
    applyFilters({
      keyword: data.keyword?.trim(),
      emailVerified: data.emailVerified,
      status: data.status
    })

  return {
    formValues,
    dataSource,
    handleSearch,
    clearFilters,
    isLoadingUser,
    isLoadingRoles,
    refetch,
    roleOptions,
    userData,
    page,
    size,
    sortBy: SORT_DIRECTION,
    setPage,
    setPageSize
  }
}

export default useFetchDataUser
