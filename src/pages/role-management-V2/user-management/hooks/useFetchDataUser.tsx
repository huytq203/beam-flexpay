import { useCallback, useMemo, useState } from 'react'
import { useGetUserQuery } from '@services/apiUserManagement'
import { useAllRoles } from '@hooks/useAllRoles'
import { UserInfor } from '@type/userManagement'
// import { RoleUserAccount } from '../constants/userAccount'
import {
  SearchUserFormData,
  UserQueryFilters
} from '../types/UserManagement.type'
import { toUserQueryFilters } from '../utils/UserManagement.utils'
import usePagination from '@hooks/usePagination'
import { RoleName } from '../../role-management/constants/RoleManagement.constant'

const useFetchDataUser = () => {

  const {
    page,
    size,
    sort: sortBy,
    sortDirection,
    setPage,
    setPageSize
  } = usePagination({
    defaultSort: 'createdTimestamp',
    defaultSortBy: 'DESC'
  })
  const [filters, setFilters] = useState<UserQueryFilters>({})
  const params = {
    page,
    size,
    sortBy,
    sortDirection,
    ...filters
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

  // Đổi filter phải về trang 1, nếu không trang hiện tại có thể vượt tổng số trang mới.
  const handleSearch = useCallback(
    (data: SearchUserFormData) => {
      setFilters(toUserQueryFilters(data))
      setPage(1)
    },
    [setPage]
  )

  return {
    dataSource,
    handleSearch,
    isLoadingUser,
    isLoadingRoles,
    refetch,
    roleOptions,
    userData,
    page,
    size,
    sortBy: sortDirection,
    setPage,
    setPageSize
  }
}

export default useFetchDataUser
