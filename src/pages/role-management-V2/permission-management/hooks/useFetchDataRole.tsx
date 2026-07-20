import { useState, useMemo } from 'react'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRole, DataRoleItem } from '@type/roleManagement'
import usePagination from '@hooks/usePagination'

const useFetchDataRole = () => {
  const { page, setPage, pageSize, setPageSize } = usePagination()
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchData, setSearchData] = useState<DataRole | null>(null)

  const {
    data: roleData,
    refetch,
    isLoading
  } = useGetRoleQuery(
    { page, size: pageSize, sortBy: 'id', sortDirection: 'DESC' },
    { skip: isSearchMode }
  )

  const currentData = isSearchMode ? searchData : roleData

  const dataSource: (DataRoleItem & { no: number })[] = useMemo(() => {
    return (
      currentData?.content?.map((item, idx) => ({
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
