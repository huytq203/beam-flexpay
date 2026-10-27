import { useState } from 'react'
import { useExportCsv } from '@hooks/useExportCsv'
import {
  useListMerchantWebhooksQuery,
  type WebhookListFilters
} from '@/app/services/merchantWebhookApi'
import { useExportMerchantWebhooksMutation } from '@services/apiExportCsv'

/** Bộ lọc dạng chuỗi của form; `enabled` là 'true' | 'false' | rỗng (tất cả). */
export interface WebhookFilterDraft {
  search: string
  scope?: WebhookListFilters['scope']
  source?: WebhookListFilters['source']
  enabled?: 'true' | 'false'
}

const EMPTY: WebhookFilterDraft = { search: '' }

const toFilters = (draft: WebhookFilterDraft): WebhookListFilters => ({
  search: draft.search.trim() || undefined,
  scope: draft.scope,
  source: draft.source,
  enabled: draft.enabled === undefined ? undefined : draft.enabled === 'true'
})

/** Danh sách webhook Master/Sub; export dùng đúng bộ lọc đã áp, bỏ phân trang. */
export function useWebhookList() {
  const [draft, setDraft] = useState<WebhookFilterDraft>(EMPTY)
  const [applied, setApplied] = useState<WebhookFilterDraft>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const filters = toFilters(applied)
  const query = useListMerchantWebhooksQuery({
    page,
    size: pageSize,
    ...filters
  })
  const [triggerExport, { reset: resetExport }] =
    useExportMerchantWebhooksMutation()
  const exporter = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'merchant-webhooks'
  })

  return {
    query,
    draft,
    setDraft,
    page,
    pageSize,
    apply: (): void => {
      setApplied(draft)
      setPage(1)
    },
    reset: (): void => {
      setDraft(EMPTY)
      setApplied(EMPTY)
      setPage(1)
    },
    paginate: (nextPage: number, nextSize: number): void => {
      setPage(nextSize !== pageSize ? 1 : nextPage)
      setPageSize(nextSize)
    },
    isExporting: exporter.isExporting,
    exportCsv: (): void => void exporter.exportFile({ ...filters })
  }
}
