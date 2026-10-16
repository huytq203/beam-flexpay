import { useState } from 'react'
import {
  useListMerchantNotificationsQuery,
  type NotificationScope,
  type NotificationSource
} from '@/app/services/merchantNotificationApi'
import { useExportMerchantNotificationsMutation } from '@services/apiExportCsv'
import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  SCOPE_OPTIONS,
  SOURCE_OPTIONS
} from '../constants/notification.constants'

export interface NotificationFiltersValue {
  search: string
  scope?: NotificationScope
  source?: NotificationSource
}

const FILTER_KEYS = ['search', 'scope', 'source'] as const
type NotificationFilterKey = (typeof FILTER_KEYS)[number]
const DEFAULT_SIZE = 20
const EMPTY_FILTERS: NotificationFiltersValue = { search: '' }

// Giá trị lạ trên URL bị bỏ qua thay vì gửi thẳng xuống API.
const toFiltersValue = (
  raw: Partial<Record<NotificationFilterKey, string>>
): NotificationFiltersValue => ({
  search: raw.search ?? '',
  scope: SCOPE_OPTIONS.find((item) => item.value === raw.scope)?.value,
  source: SOURCE_OPTIONS.find((item) => item.value === raw.source)?.value
})

// Bộ lọc nháp chỉ áp dụng khi bấm Tìm kiếm; xuất CSV dùng đúng bộ lọc đang áp.
export const useNotificationList = () => {
  const url = useUrlFilters<NotificationFilterKey>({
    keys: FILTER_KEYS,
    defaultSize: DEFAULT_SIZE
  })
  const filters = toFiltersValue(url.filters)
  const [draft, setDraft] = useState(filters)
  const params = {
    search: filters.search || undefined,
    scope: filters.scope,
    source: filters.source
  }
  const query = useListMerchantNotificationsQuery({
    page: url.page,
    size: url.size,
    ...params
  })
  const [triggerExport, { reset }] = useExportMerchantNotificationsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset,
    filenamePrefix: 'cau-hinh-thong-bao'
  })

  return {
    draft,
    setDraft,
    page: url.page,
    size: url.size,
    query,
    isExporting,
    exportCsv: () => void exportFile(params),
    apply: () => url.applyFilters({ ...draft, search: draft.search.trim() }),
    reset: () => {
      setDraft(EMPTY_FILTERS)
      url.clearFilters()
    },
    changePage: (nextPage: number, nextSize: number) => {
      if (nextSize !== url.size) url.setPageSize(nextSize)
      else url.setPage(nextPage)
    }
  }
}
