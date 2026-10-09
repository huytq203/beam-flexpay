import { useState } from 'react'
import { useGetUnifiedQuery } from '@services/apiJournal'
import type { MerchantTransactionFilters } from '../types/merchantTransaction.types'
import { buildMerchantTransactionParams } from '../utils/merchantTransaction.utils'

const EMPTY_FILTERS: MerchantTransactionFilters = { keyword: '' }

// Bộ lọc nháp chỉ áp dụng khi bấm Tìm kiếm, trừ ô tóm tắt trạng thái áp ngay.
export const useMerchantTransactionList = () => {
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const query = useGetUnifiedQuery(
    buildMerchantTransactionParams(filters, page, size)
  )

  return {
    draft,
    setDraft,
    filters,
    page,
    size,
    query,
    apply: () => {
      setFilters(draft)
      setPage(1)
    },
    reset: () => {
      setDraft(EMPTY_FILTERS)
      setFilters(EMPTY_FILTERS)
      setPage(1)
    },
    changeStatus: (status?: string) => {
      setDraft((current) => ({ ...current, status }))
      setFilters((current) => ({ ...current, status }))
      setPage(1)
    },
    changePage: (nextPage: number, nextSize: number) => {
      setPage(nextSize !== size ? 1 : nextPage)
      setSize(nextSize)
    }
  }
}
