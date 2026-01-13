import { useState } from 'react'

interface UsePaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
  defaultSort?: string
}

const usePagination = (options?: UsePaginationOptions) => {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    defaultSort = 'createdAt'
  } = options || {}

  const [page, setPage] = useState(defaultPage)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [sort, setSort] = useState(defaultSort)

  return {
    page,
    pageSize,
    sort,

    setPage,
    setPageSize,
    setSort,

    params: {
      page,
      size: pageSize,
      sort
    }
  }
}

export default usePagination
