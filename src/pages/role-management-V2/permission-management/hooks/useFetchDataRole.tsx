import { useState, useMemo } from 'react'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRoleItem } from '@type/roleManagement'
import usePagination from '@hooks/usePagination'

const useFetchDataRole = () => {
  const { page, setPage, pageSize, setPageSize } = usePagination()
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchData, setSearchData] = useState<any>(null)

  const {
    data: roleData,
    refetch,
    isLoading
  } = useGetRoleQuery(
    { page, size: pageSize, sortBy: 'id', sortDirection: 'DESC' },
    { skip: isSearchMode }
  )

  const currentData = isSearchMode ? searchData : roleData

  const dataSource: DataRoleItem[] = useMemo(() => {
    return (
      currentData?.content?.map((item: any, idx: number) => ({
        ...item,
        no: (page - 1) * pageSize + idx + 1
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

export default useFetchDataRole
