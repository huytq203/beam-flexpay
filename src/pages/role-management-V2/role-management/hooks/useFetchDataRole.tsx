import usePagination from '@/app/hooks/usePagination'
import { useGetRoleByKeyQuery } from '@/app/services/apiRole'
import { useMemo, useState } from 'react'
import { RoleName } from '../constants/RoleManagement.constant'

export interface PayloadType {
  keyword: string
}

const useFetchDataRole = () => {
  const {
    page,
    size,
    sort: sortBy,
    sortDirection,
    setPage,
    setPageSize
  } = usePagination({
    defaultPageSize: 10
  })
  const [keyword, setKeyWord] = useState('')
  const payload = {
    keyword,
    page,
    size,
    sortDirection,
    sortBy
  }
  const {
    data: roleData,
    isLoading: isLoadingRoleData,
    refetch
  } = useGetRoleByKeyQuery(payload)

  const convertedRoleData = useMemo(() => {
    if (!roleData) return roleData

    return {
      ...roleData,
      content: roleData.content.map((role, index) => ({
        ...role,
        no: (page - 1) * size + index + 1
      }))
    }
  }, [page, roleData, size])

  const roleOptions = useMemo(
    () =>
      roleData?.content.map((role) => ({
        value: role.name,
        label: RoleName[role.name] ?? role.name
      })) ?? [],
    [roleData?.content]
  )

  const handleSearch = async (payload: PayloadType) => {
    setKeyWord(payload.keyword)
    setPage(1)
  }

  return {
    handleSearch,
    roleData: convertedRoleData,
    roleOptions,
    isLoadingRoleData,
    refetch,
    page,
    size,
    sort: sortBy,
    sortDirection,
    setPage,
    setPageSize
  }
}

export default useFetchDataRole
