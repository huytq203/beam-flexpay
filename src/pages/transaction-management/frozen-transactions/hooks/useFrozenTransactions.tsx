import usePagination from '@hooks/usePagination'
import { useGetFreezesQuery } from '@services/apiFreezes'
import { useMemo, useState } from 'react'

const useFrozenTransactions = () => {
  const [filter, setFilter] = useState({})

  const { params, page, pageSize, setPage, setPageSize } = usePagination({
    defaultSort: 'createdAt',
  })

  const { data, isFetching ,isLoading} = useGetFreezesQuery({ ...params, ...filter })

  const totalElements = data?.totalElements

  const dataSource = useMemo(
    () =>
      data?.content?.map((item, idx) => ({
        no: (page - 1) * pageSize + idx + 1,
        ...item,
      })),
    [data, page, pageSize]
  )

  const handleSearch = (values: Record<string, unknown>) => {
    setFilter(values)
    setPage(1)
  }

  return {
    dataSource,
    totalElements,
    page,
    pageSize,
    setPage,
    setPageSize,
    isFetching,
    handleSearch,
    isLoading
  }
}

export default useFrozenTransactions