import { useMemo, useState } from 'react'
import usePagination from '@hooks/usePagination'
import { useGetPermissionByKeyQuery } from '@services/apiPermission'
import { SearchPermissionFormData } from '../types/PermissionManagement.type'
import { translatePermissionName } from '../constants/PermissionManagement.constant'

const useFetchDataPermission = () => {
  const {
    page,
    size,
    sort: sortBy,
    sortDirection,
    setPage,
    setPageSize
  } = usePagination({ defaultPageSize: 10 })
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

  const permissionOptions = useMemo(
    () =>
      query.data?.content.map((permission) => ({
        value: permission.name,
        label: translatePermissionName(permission.name)
      })) ?? [],
    [query.data?.content]
  )

  const handleSearch = ({ keyword: nextKeyword }: SearchPermissionFormData) => {
    setPage(1)
    setKeyword(nextKeyword.trim())
  }

  return {
    handleSearch,
    permissionData,
    permissionOptions,
    isLoadingPermissionData: query.isLoading || query.isFetching,
    refetch: query.refetch,
    page,
    size,
    setPage,
    setPageSize
  }
}

export default useFetchDataPermission
