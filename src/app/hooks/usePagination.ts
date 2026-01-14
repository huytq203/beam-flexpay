import { useState } from 'react'

interface UsePaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
  defaultSort?: string
  defaultSortBy?: string
}

const usePagination = (options?: UsePaginationOptions) => {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    defaultSort = 'createdAt',
    defaultSortBy='DESC'
  } = options || {}

  const [page, setPage] = useState(defaultPage)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [sort, setSort] = useState(defaultSort)
  const [sortBy, setSortBy] = useState(defaultSortBy)

  return {
    page,
    pageSize,
    sort,
    sortBy,

    setPage,
    setPageSize,
    setSort,
    setSortBy,

    params: {
      page,
      size: pageSize,
      sort,
      sortBy
    }
  }
}

export default usePagination
