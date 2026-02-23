import { useState, useMemo } from 'react'
import { useGetPermissionQuery } from '@services/apiPermission'
import { RoleData } from '@type/roleManagementV2'

export const useRoleManagementPagination = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchData, setSearchData] = useState<RoleData | null>(null)

  const paginationParams = {
    page: page,
    size: pageSize,
    sortBy: 'id',
    sortDirection: 'DESC'
  }

  const {
    data: getPermission,
    isLoading: loadGetRole,
    refetch
  } = useGetPermissionQuery(paginationParams, {
    skip: isSearchMode
  })
 
  const currentData = isSearchMode ? searchData : getPermission

  const dataSource = useMemo(() => {
    return currentData?.content.map((item, index) => ({
      ...item,
      no: (page - 1) * pageSize + index + 1
    }))
  }, [currentData?.content, page, pageSize])

  const totalElements = currentData?.totalElements

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    isSearchMode,
    setIsSearchMode,
    searchData,
    setSearchData,
    getPermission,
    loadGetRole,
    refetch,
    dataSource,
    totalElements
  }
}
