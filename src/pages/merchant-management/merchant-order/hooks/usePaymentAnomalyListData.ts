import { useState } from 'react'
import { useGetMerchantPaymentAnomaliesQuery } from '@/app/services/apiOrderMerchant.api'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  ANOMALY_FILTER_KEYS,
  EMPTY_ANOMALY_FILTERS,
  ORDER_DEFAULT_PAGE_SIZE,
  type AnomalyFilterKey
} from '../constants/merchantOrder.constants'
import type { AnomalyFilters } from '../types/merchantOrder.types'
import { fromAnomalyUrlFilters } from '../utils/merchantOrderFilters.utils'

export function usePaymentAnomalyListData() {
  const url = useUrlFilters<AnomalyFilterKey>({
    keys: ANOMALY_FILTER_KEYS,
    defaultSize: ORDER_DEFAULT_PAGE_SIZE,
    storageKey: 'merchant-order:anomalies'
  })
  const filters = fromAnomalyUrlFilters(url.filters)
  const [draft, setDraft] = useState<AnomalyFilters>(filters)
  const anomaliesQuery = useGetMerchantPaymentAnomaliesQuery({
    page: url.page,
    size: url.size,
    status: filters.status
  })

  return {
    draft,
    setDraft,
    page: url.page,
    pageSize: url.size,
    setPagination: url.setPagination,
    anomaliesQuery,
    anomalies: anomaliesQuery.data?.content ?? [],
    total: anomaliesQuery.data?.totalElements ?? 0,
    apply: (): void => url.applyFilters({ status: draft.status }),
    reset: (): void => {
      setDraft(EMPTY_ANOMALY_FILTERS)
      url.clearFilters()
    }
  }
}
