import { useState } from 'react'
import {
  useListMerchantNotificationsQuery,
  type NotificationScope,
  type NotificationSource
} from '@/app/services/merchantNotificationApi'
import { useExportMerchantNotificationsMutation } from '@services/apiExportCsv'
import { useExportCsv } from '@hooks/useExportCsv'

export interface NotificationFiltersValue {
  search: string
  scope?: NotificationScope
  source?: NotificationSource
}

const EMPTY_FILTERS: NotificationFiltersValue = { search: '' }

// Bộ lọc nháp chỉ áp dụng khi bấm Tìm kiếm; xuất CSV dùng đúng bộ lọc đang áp.
export const useNotificationList = () => {
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const params = {
    search: filters.search || undefined,
    scope: filters.scope,
    source: filters.source
  }
  const query = useListMerchantNotificationsQuery({ page, size, ...params })
  const [triggerExport, { reset }] = useExportMerchantNotificationsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset,
    filenamePrefix: 'cau-hinh-thong-bao'
  })

  return {
    draft,
    setDraft,
    page,
    size,
    query,
    isExporting,
    exportCsv: () => void exportFile(params),
    apply: () => {
      setFilters({ ...draft, search: draft.search.trim() })
      setPage(1)
    },
    reset: () => {
      setDraft(EMPTY_FILTERS)
      setFilters(EMPTY_FILTERS)
      setPage(1)
    },
    changePage: (nextPage: number, nextSize: number) => {
      setPage(nextSize !== size ? 1 : nextPage)
      setSize(nextSize)
    }
  }
}
