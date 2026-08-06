import { useCallback, useMemo, useState } from 'react'
import { useGetUserQuery } from '@services/apiUserManagement'
import { useAllRoles } from '@hooks/useAllRoles'
import { UserInfor } from '@type/userManagement'
import { RoleUserAccount } from '../constants/userAccount'
import {
  SearchUserFormData,
  UserQueryFilters
} from '../types/UserManagement.type'
import { toUserQueryFilters } from '../utils/UserManagement.utils'
import dayjs from 'dayjs'
import usePagination from '@hooks/usePagination'

const useFetchDataUser = () => {

  const { page, size, sortBy, sort,setPage,setPageSize } = usePagination()
  const [filters, setFilters] = useState<UserQueryFilters>({})
  const params = {
    page,
    size,
    sortBy: sort || 'id',
    sortDirection: sortBy || 'DESC',
    ...filters
  }
  const { data: userData, isLoading: isLoadingUser, refetch } = useGetUserQuery(params)

  const { roles, isLoading: isLoadingRoles } = useAllRoles()

  const dataSource = useMemo(() => {
    return (
      userData?.content?.map((item: UserInfor, index: number) => ({
        ...item,
        no: (page - 1) * size + index + 1,
        createdTimestamp: item.createdTimestamp
          ? dayjs(item.createdTimestamp).format('DD/MM/YYYY HH:mm:ss')
          : '--'
      })) ?? []
    )
  }, [userData?.content, page, size])

  const roleOptions = useMemo(() => {
    return roles.map((role) => ({
      value: role.id,
      label: RoleUserAccount[role.name as keyof typeof RoleUserAccount] ?? role.name
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
    sortBy,
    setPage,
    setPageSize
  }
}

export default useFetchDataUser
