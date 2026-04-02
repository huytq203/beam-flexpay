import { useMemo } from 'react'
import { useGetUserQuery } from '@services/apiUserManagement'
import { useGetRoleQuery } from '@services/apiRole'
import { UserInfor } from '@type/userManagement'
import { RoleUserAccount } from '../constants/userAccount'
import dayjs from 'dayjs'
import usePagination from '@hooks/usePagination'

const useFetchDataUser = () => {

  const { page, size, sortBy, sort,setPage,setPageSize } = usePagination()
  const params = {
    page,
    size,
    sortBy: sort || 'id',
    sortDirection: sortBy || 'DESC'
  }
  const { data: userData, isLoading: isLoadingUser, refetch } = useGetUserQuery(params)

  const { data: roleData, isLoading: isLoadingRoles } = useGetRoleQuery({
    page: 1,
    size: 1000
  })

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
  }, [userData?.content])

  const roleOptions = useMemo(() => {
    return (
      roleData?.content?.map((role) => ({
        value: role.name,
        label: RoleUserAccount[role.name as keyof typeof RoleUserAccount] ?? role.name
      })) ?? []
    )
  }, [roleData?.content])

  return {
    dataSource,
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
