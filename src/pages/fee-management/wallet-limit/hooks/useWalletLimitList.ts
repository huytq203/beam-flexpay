import { useState } from 'react'
import { useGetWalletLimitPoliciesQuery } from '@services/apiWalletLimit'
import { WALLET_LIMIT_DEFAULT_PAGE_SIZE } from '../constants/walletLimit.constants'
import {
  EMPTY_WALLET_LIMIT_FILTERS,
  type WalletLimitListFilters
} from '../types/walletLimitList.types'
import { buildWalletLimitListParams } from '../utils/walletLimit.listParams'

// Bộ lọc nháp chỉ áp dụng khi bấm Tìm kiếm.
export const useWalletLimitList = () => {
  const [draft, setDraft] = useState<WalletLimitListFilters>(
    EMPTY_WALLET_LIMIT_FILTERS
  )
  const [filters, setFilters] = useState<WalletLimitListFilters>(
    EMPTY_WALLET_LIMIT_FILTERS
  )
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(WALLET_LIMIT_DEFAULT_PAGE_SIZE)
  const query = useGetWalletLimitPoliciesQuery(
    buildWalletLimitListParams(filters, page, size)
  )

  return {
    draft,
    setDraft,
    page,
    size,
    query,
    apply: () => {
      setFilters(draft)
      setPage(1)
    },
    reset: () => {
      setDraft(EMPTY_WALLET_LIMIT_FILTERS)
      setFilters(EMPTY_WALLET_LIMIT_FILTERS)
      setPage(1)
    },
    changePage: (nextPage: number, nextSize: number) => {
      setPage(nextSize !== size ? 1 : nextPage)
      setSize(nextSize)
    }
  }
}
