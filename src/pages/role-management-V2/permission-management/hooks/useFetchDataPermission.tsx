import { useMemo } from 'react'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { useGetPermissionByKeyQuery } from '@services/apiPermission'
import { SearchPermissionFormData } from '../types/PermissionManagement.type'

const FILTER_KEYS = ['keyword'] as const
const SORT_BY = 'createdAt'
const SORT_DIRECTION = 'DESC'

const useFetchDataPermission = () => {
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

  const query = useGetPermissionByKeyQuery({
    keyword,
    page,
    size,
    sortBy: SORT_BY,
    sortDirection: SORT_DIRECTION
  })

  const permissionData = useMemo(() => {
    if (!query.data) return query.data

    return {
      ...query.data,
      content: query.data.content.map((permission, index) => ({
        ...permission,
        no: (page - 1) * size + index + 1
      }))
    }
  }, [page, query.data, size])

  const handleSearch = ({ keyword: nextKeyword }: SearchPermissionFormData) =>
    applyFilters({ keyword: nextKeyword.trim() })

  return {
    keyword,
    handleSearch,
    clearFilters,
    permissionData,
    isLoadingPermissionData: query.isLoading || query.isFetching,
    refetch: query.refetch,
    page,
    size,
    setPage,
    setPageSize
  }
}

export default useFetchDataPermission
