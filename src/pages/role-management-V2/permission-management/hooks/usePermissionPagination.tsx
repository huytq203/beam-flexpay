import { useState, useMemo } from 'react'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { RoleData } from '@type/roleManagementV2'
import { DataRoleItem } from '@type/roleManagement'
import usePagination from '@hooks/usePagination'

export const usePermissionPagination = () => {
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchData, setSearchData] = useState<RoleData | null>(null)

  const { page, setPage, pageSize, setPageSize } = usePagination()

  const defaultPagination = useMemo(
    () => ({
      page: page,
      size: pageSize,
      sortBy: 'id',
      sortDirection: 'DESC'
    }),
    [page, pageSize]
  )

  const {
    data: getRole,
    refetch,
    isLoading: isLoadingRole
  } = useGetRoleQuery(defaultPagination, {
    skip: isSearchMode
  })

  const currentData = useMemo(
    () => (isSearchMode ? searchData : getRole),
    [isSearchMode, searchData, getRole]
  )

  const dataSource: DataRoleItem[] = useMemo(() => {
    return (
      currentData?.content.map((item, idx) => ({
        ...item,
        no: (page - 1) * pageSize + idx + 1
      })) ?? []
    )
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
    getRole,
    refetch,
    isLoadingRole,
    currentData,
    dataSource,
    totalElements
  }
}
