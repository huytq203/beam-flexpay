import { useState } from 'react'
import { useExportCsv } from '@hooks/useExportCsv'
import { useListSettlementConfigsQuery } from '@/app/services/merchantSettlementScopeApi'
import { useExportSettlementConfigsMutation } from '@services/apiExportCsv'
import type { ConfigListSource } from '../types/settlementScope.types'

export interface ConfigListFilters {
  search: string
  source?: ConfigListSource
}

const EMPTY: ConfigListFilters = { search: '' }

/** Danh sách Master kèm cấu hình hiệu lực; bộ lọc chỉ áp khi bấm Tìm kiếm, export dùng đúng bộ đã áp. */
export function useMasterConfigList() {
  const [draft, setDraft] = useState<ConfigListFilters>(EMPTY)
  const [applied, setApplied] = useState<ConfigListFilters>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const filters = {
    search: applied.search.trim() || undefined,
    source: applied.source
  }
  const query = useListSettlementConfigsQuery({
    page,
    size: pageSize,
    ...filters
  })
  const [triggerExport, { reset: resetExport }] =
    useExportSettlementConfigsMutation()
  const exporter = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'merchant-settlement-configs'
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
    exportCsv: (): void => void exporter.exportFile(filters)
  }
}
