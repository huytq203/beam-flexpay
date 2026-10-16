import { useState } from 'react'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { useGetWalletLimitPoliciesQuery } from '@services/apiWalletLimit'
import { WALLET_LIMIT_DEFAULT_PAGE_SIZE } from '../constants/walletLimit.constants'
import {
  EMPTY_WALLET_LIMIT_FILTERS,
  type WalletLimitListFilters
} from '../types/walletLimitList.types'
import { buildWalletLimitListParams } from '../utils/walletLimit.listParams'
import {
  toWalletLimitFilters,
  toWalletLimitUrlFilters,
  WALLET_LIMIT_FILTER_KEYS,
  WALLET_LIMIT_SENSITIVE_KEYS,
  type WalletLimitFilterKey
} from '../utils/walletLimit.urlFilters'

/**
 * Bộ lọc đang áp, trang và cỡ trang sống trên URL (kèm bản sao sessionStorage)
 * nên quay lại màn vẫn ra đúng bảng cũ. Bộ lọc nháp chỉ áp khi bấm Tìm kiếm.
 */
export const useWalletLimitList = () => {
  const url = useUrlFilters<WalletLimitFilterKey>({
    keys: WALLET_LIMIT_FILTER_KEYS,
    sensitiveKeys: WALLET_LIMIT_SENSITIVE_KEYS,
    defaultSize: WALLET_LIMIT_DEFAULT_PAGE_SIZE
  })
  const filters = toWalletLimitFilters(url.filters)
  const [draft, setDraft] = useState<WalletLimitListFilters>(filters)
  const query = useGetWalletLimitPoliciesQuery(
    buildWalletLimitListParams(filters, url.page, url.size)
  )

  return {
    draft,
    setDraft,
    page: url.page,
    size: url.size,
    query,
    apply: () => url.applyFilters(toWalletLimitUrlFilters(draft)),
    reset: () => {
      setDraft(EMPTY_WALLET_LIMIT_FILTERS)
      url.clearFilters()
    },
    changePage: (nextPage: number, nextSize: number) => {
      if (nextSize !== url.size) url.setPageSize(nextSize)
      else url.setPage(nextPage)
    }
  }
}
