import { useMemo, useState } from 'react'
import usePagination from '@hooks/usePagination'
import { useGetPermissionByKeyQuery } from '@services/apiPermission'
import { SearchPermissionFormData } from '../types/PermissionManagement.type'

const useFetchDataPermission = () => {
  const {
    page,
    size,
    sort: sortBy,
    sortDirection,
    setPage,
    setPageSize
  } = usePagination({
    defaultPageSize: 10,
    defaultSort: 'createdAt',
    defaultSortBy: 'DESC'
  })
  const [keyword, setKeyword] = useState('')

  const query = useGetPermissionByKeyQuery({
    keyword,
    page,
    size,
    sortBy,
    sortDirection
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

  const handleSearch = ({ keyword: nextKeyword }: SearchPermissionFormData) => {
    setPage(1)
    setKeyword(nextKeyword.trim())
  }

  return {
    handleSearch,
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
