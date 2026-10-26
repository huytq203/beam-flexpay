import { skipToken } from '@reduxjs/toolkit/query'
import { useState } from 'react'
import {
  useGetSettlementItemTotalsQuery,
  useListSettlementItemsQuery
} from '@/app/services/merchantSettlementItemApi'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  EMPTY_SETTLEMENT_FILTERS,
  SETTLEMENT_DEFAULT_PAGE_SIZE,
  SETTLEMENT_FILTER_KEYS,
  type SettlementFilterKey
} from '../constants/settlementItem.constants'
import type {
  SettlementItemFilterError,
  SettlementItemFilters
} from '../types/settlementItem.types'
import {
  fromSettlementUrlFilters,
  toSettlementQuery,
  toSettlementUrlFilters,
  validateSettlementFilters
} from '../utils/settlementItem.utils'

/**
 * Danh sách và dòng tổng gọi song song. Sub + khoảng ngày là bắt buộc: thiếu
 * một tham số BE trả 500, nên bộ lọc chưa đủ thì không gọi API (`skip`).
 */
export function useSettlementItemList() {
  const url = useUrlFilters<SettlementFilterKey>({
    keys: SETTLEMENT_FILTER_KEYS,
    defaultSize: SETTLEMENT_DEFAULT_PAGE_SIZE,
    storageKey: 'merchant-settlement-item:list'
  })
  const filters = fromSettlementUrlFilters(url.filters)
  const [draft, setDraft] = useState<SettlementItemFilters>(filters)
  const [filterError, setFilterError] = useState<SettlementItemFilterError>()
  const query = toSettlementQuery(filters)
  const listQuery = useListSettlementItemsQuery(
    query ? { ...query, page: url.page, size: url.size } : skipToken
  )
  const totalsQuery = useGetSettlementItemTotalsQuery(query ?? skipToken)

  return {
    draft,
    setDraft: (next: SettlementItemFilters): void => {
      setDraft(next)
      setFilterError(undefined)
    },
    filterError,
    hasQuery: !!query,
    page: url.page,
    pageSize: url.size,
    setPagination: url.setPagination,
    listQuery,
    totalsQuery,
    items: listQuery.data?.content ?? [],
    total: listQuery.data?.totalElements ?? 0,
    selectedSubId: filters.subMerchantId,
    apply: (): void => {
      const error = validateSettlementFilters(draft)
      setFilterError(error)
      if (!error) url.applyFilters(toSettlementUrlFilters(draft))
    },
    reset: (): void => {
      setDraft(EMPTY_SETTLEMENT_FILTERS)
      setFilterError(undefined)
      url.clearFilters()
    }
  }
}
