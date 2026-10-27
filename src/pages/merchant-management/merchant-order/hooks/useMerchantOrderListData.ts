import { useState } from 'react'
import { useGetMerchantOrderQuery } from '@/app/services/apiOrderMerchant.api'
import { useExportMerchantOrdersMutation } from '@services/apiExportCsv'
import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  EMPTY_ORDER_FILTERS,
  ORDER_DEFAULT_PAGE_SIZE,
  ORDER_FILTER_KEYS,
  type OrderFilterKey
} from '../constants/merchantOrder.constants'
import type { OrderFilters } from '../types/merchantOrder.types'
import {
  fromOrderUrlFilters,
  toOrderUrlFilters
} from '../utils/merchantOrderFilters.utils'

export function useMerchantOrderListData() {
  const url = useUrlFilters<OrderFilterKey>({
    keys: ORDER_FILTER_KEYS,
    defaultSize: ORDER_DEFAULT_PAGE_SIZE,
    storageKey: 'merchant-order:orders'
  })
  const filters = fromOrderUrlFilters(url.filters)
  const [draft, setDraft] = useState<OrderFilters>(filters)
  // BE chỉ nhận đúng các bộ lọc này; chuỗi rỗng không gửi để khỏi lọc nhầm.
  const params = {
    merchantCode: filters.merchantCode.trim() || undefined,
    merchantId: filters.merchantId,
    orderCode: filters.orderCode.trim() || undefined,
    status: filters.status
  }
  const ordersQuery = useGetMerchantOrderQuery({
    page: url.page,
    size: url.size,
    ...params
  })
  // Xuất CSV dùng đúng bộ lọc đang áp, không phân trang.
  const [triggerExport, { reset: resetExport }] =
    useExportMerchantOrdersMutation()
  const exporter = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'merchant-orders'
  })

  return {
    draft,
    setDraft,
    page: url.page,
    pageSize: url.size,
    setPagination: url.setPagination,
    ordersQuery,
    isExporting: exporter.isExporting,
    exportCsv: (): void => void exporter.exportFile(params),
    orders: ordersQuery.data?.content ?? [],
    total: ordersQuery.data?.totalElements ?? 0,
    apply: (): void => url.applyFilters(toOrderUrlFilters(draft)),
    reset: (): void => {
      setDraft(EMPTY_ORDER_FILTERS)
      url.clearFilters()
    }
  }
}
