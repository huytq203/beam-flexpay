import { useState } from 'react'
import { HISTORY_PAGE_SIZE } from '../constants/merchantDetail.constants'

/** Trang bắt đầu từ 1 (BE nhận page 1-based); đổi kích thước thì về trang đầu. */
export const useHistoryPaging = () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(HISTORY_PAGE_SIZE)

  const changePage = (nextPage: number, nextSize: number) => {
    if (nextSize !== size) {
      setSize(nextSize)
      setPage(1)
      return
    }
    setPage(nextPage)
  }

  return { page, size, changePage }
}
