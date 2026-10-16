import { useState } from 'react'
import { useGetUnifiedQuery } from '@services/apiJournal'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  MERCHANT_TRANSACTION_FILTER_KEYS,
  MERCHANT_TRANSACTION_SENSITIVE_KEYS,
  type MerchantTransactionFilterKey
} from '../constants/merchantTransaction.constants'
import type { MerchantTransactionFilters } from '../types/merchantTransaction.types'
import {
  buildMerchantTransactionParams,
  fromUrlFilters,
  toUrlFilters
} from '../utils/merchantTransaction.utils'

const EMPTY_FILTERS: MerchantTransactionFilters = { keyword: '' }

// Bộ lọc nháp chỉ áp dụng khi bấm Tìm kiếm, trừ ô tóm tắt trạng thái áp ngay.
export const useMerchantTransactionList = () => {
  const url = useUrlFilters<MerchantTransactionFilterKey>({
    keys: MERCHANT_TRANSACTION_FILTER_KEYS,
    sensitiveKeys: MERCHANT_TRANSACTION_SENSITIVE_KEYS
  })
  const filters = fromUrlFilters(url.filters)
  const [draft, setDraft] = useState(filters)
  const query = useGetUnifiedQuery(
    buildMerchantTransactionParams(filters, url.page, url.size)
  )

  return {
    draft,
    setDraft,
    filters,
    page: url.page,
    size: url.size,
    query,
    apply: () => url.applyFilters(toUrlFilters(draft)),
    reset: () => {
      setDraft(EMPTY_FILTERS)
      url.clearFilters()
    },
    changeStatus: (status?: string) => {
      setDraft((current) => ({ ...current, status }))
      url.applyFilters(toUrlFilters({ ...filters, status }))
    },
    changePage: (nextPage: number, nextSize: number) => {
      if (nextSize !== url.size) url.setPageSize(nextSize)
      else url.setPage(nextPage)
    }
  }
}
