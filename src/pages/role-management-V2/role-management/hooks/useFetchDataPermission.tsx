import { useState, useMemo } from 'react'
import { useGetPermissionQuery } from '@services/apiPermission'
import usePagination from '@hooks/usePagination'

const useFetchDataPermission = () => {
  const { page, setPage, pageSize, setPageSize } = usePagination()
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchData, setSearchData] = useState<any>(null)

  const {
    data: permissionData,
    isLoading,
    refetch
  } = useGetPermissionQuery(
    { page, size: pageSize, sortBy: 'id', sortDirection: 'DESC' },
    { skip: isSearchMode }
  )

  const currentData = isSearchMode ? searchData : permissionData

  const dataSource = useMemo(() => {
    return (
      currentData?.content?.map((item: any, index: number) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1
      })) ?? []
    )
  }, [currentData?.content, page, pageSize])

  const totalElements = currentData?.totalElements

  return {
    dataSource,
    totalElements,
    isLoading,
    refetch,
    page,
    pageSize,
    setPage,
    setPageSize,
    setIsSearchMode,
    setSearchData
  }
}

export default useFetchDataPermission
