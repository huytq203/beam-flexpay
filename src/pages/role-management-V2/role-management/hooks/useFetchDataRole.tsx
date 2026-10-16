import { useUrlFilters } from '@hooks/useUrlFilters'
import { useGetRoleByKeyQuery } from '@/app/services/apiRole'
import { useMemo } from 'react'
import { RoleName } from '../constants/RoleManagement.constant'

export interface PayloadType {
  keyword: string
}

const FILTER_KEYS = ['keyword'] as const
const SORT_BY = 'createdAt'
const SORT_DIRECTION = 'DESC'

const useFetchDataRole = () => {
  const {
    filters,
    applyFilters,
    clearFilters,
    page,
    size,
    setPage,
    setPageSize
  } = useUrlFilters({ keys: FILTER_KEYS })
  const keyword = filters.keyword ?? ''
  const payload = {
    keyword,
    page,
    size,
    sortDirection: SORT_DIRECTION,
    sortBy: SORT_BY
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

  const handleSearch = (payload: PayloadType) =>
    applyFilters({ keyword: payload.keyword })

  return {
    keyword,
    handleSearch,
    clearFilters,
    roleData: convertedRoleData,
    roleOptions,
    isLoadingRoleData,
    refetch,
    page,
    size,
    sort: SORT_BY,
    sortDirection: SORT_DIRECTION,
    setPage,
    setPageSize
  }
}

export default useFetchDataRole
