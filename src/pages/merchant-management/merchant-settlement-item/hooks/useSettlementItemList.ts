import { skipToken } from '@reduxjs/toolkit/query'
import { useState } from 'react'
import {
  useGetSettlementItemTotalsQuery,
  useListSettlementItemsQuery
} from '@/app/services/merchantSettlementItemApi'
import { useExportSettlementItemsMutation } from '@services/apiExportCsv'
import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  EMPTY_SETTLEMENT_FILTERS,
  SETTLEMENT_DEFAULT_PAGE_SIZE,
  SETTLEMENT_FILTER_KEYS,
  type SettlementFilterKey
} from '../constants/settlementItem.constants'
import type {
  SettlementItemFilterError,
  SettlementItemFilters,
  SettlementItemSort
} from '../types/settlementItem.types'
import {
  fromSettlementUrlFilters,
  fromSettlementUrlSort,
  toSettlementQuery,
  toSettlementUrlFilters,
  validateSettlementFilters
} from '../utils/settlementItem.utils'

/**
 * Danh sách và dòng tổng gọi song song. Chỉ khoảng ngày là bắt buộc (Merchant
 * và Sub tùy chọn): chưa đủ hợp lệ thì không gọi API (`skip`). Sắp xếp nằm
 * trên URL và chỉ list/export nhận, `/totals` không.
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
  const sort = fromSettlementUrlSort(url.filters)
  const query = toSettlementQuery(filters)
  const listQuery = useListSettlementItemsQuery(
    query ? { ...query, ...sort, page: url.page, size: url.size } : skipToken
  )
  const totalsQuery = useGetSettlementItemTotalsQuery(query ?? skipToken)
  const [triggerExport, { reset: resetExport }] =
    useExportSettlementItemsMutation()
  const exporter = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'merchant-settlement-items'
  })

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
    sort,
    isExporting: exporter.isExporting,
    // Xuất đúng bộ lọc và sắp xếp đang áp, không phân trang.
    exportCsv: (): void => {
      if (query) void exporter.exportFile({ ...query, ...sort })
    },
    setSort: (next: SettlementItemSort): void =>
      url.applyFilters({
        ...toSettlementUrlFilters(filters),
        sortBy: next.sortBy,
        sortDirection: next.sortDirection
      }),
    apply: (): void => {
      const error = validateSettlementFilters(draft)
      setFilterError(error)
      if (!error)
        url.applyFilters({
          ...toSettlementUrlFilters(draft),
          sortBy: sort.sortBy,
          sortDirection: sort.sortDirection
        })
    },
    reset: (): void => {
      setDraft(EMPTY_SETTLEMENT_FILTERS)
      setFilterError(undefined)
      url.clearFilters()
    }
  }
}
