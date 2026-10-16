import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  useExportFreezesMutation,
  type ExportFreezesQuery
} from '@services/apiExportCsv'
import { useGetFreezesQuery, type FreezeSearchParams } from '@services/apiFreezes'
import { FreezeItem } from '@type/freeze.type'
import { useMemo, useState } from 'react'

export const FROZEN_FILTER_KEYS = [
  'username',
  'sourceTransactionCode',
  'displayStatus',
  'type',
  'releaseType',
  'fromDate',
  'toDate'
] as const

export type FrozenFilterKey = (typeof FROZEN_FILTER_KEYS)[number]
export type FrozenFilters = Partial<Record<FrozenFilterKey, string>>
// Username của ví chính là SĐT nên không đưa lên URL (rule 05).
const FROZEN_SENSITIVE_KEYS: readonly FrozenFilterKey[] = ['username']

const useFrozenTransactions = () => {
  const {
    filters: filter,
    applyFilters,
    clearFilters,
    page,
    size: pageSize,
    setPage,
    setPageSize
  } = useUrlFilters<FrozenFilterKey>({
    keys: FROZEN_FILTER_KEYS,
    sensitiveKeys: FROZEN_SENSITIVE_KEYS
  })

  const payload: FreezeSearchParams = {
    page: page,
    size: pageSize,
    ...filter,
    includeSummary: true
  }
  const { data, isFetching, isLoading, refetch } =
    useGetFreezesQuery(payload)

  const totalElements = data?.totalElements

  const dataSource = useMemo(
    () =>
      data?.content?.map((item, idx) => ({
        no: (page - 1) * pageSize + idx + 1,
        ...item,
      })),
    [data, page, pageSize]
  )

  /** Bộ lọc nằm trên URL (kèm bản sao sessionStorage) nên quay lại màn vẫn giữ trang cũ. */
  const handleSearch = (values: FrozenFilters) => applyFilters(values)

  const handleChangePage = (nextPage: number, nextSize: number) => {
    if (nextSize !== pageSize) setPageSize(nextSize)
    else setPage(nextPage)
  }

  const [triggerExport, { reset: resetExport }] = useExportFreezesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'giao-dich-dong-bang'
  })

  /** Endpoint xuất không nhận page/size — file lấy trọn bộ lọc đang áp, không theo trang. */
  const handleExport = () => {
    const exportParams: ExportFreezesQuery = filter
    void exportFile(exportParams)
  }

  const [isUnfreezeModalOpen, setIsUnfreezeModalOpen] = useState(false)
  const [selectedFreezeItem, setSelectedFreezeItem] = useState<FreezeItem | null>(null)

  const handleOpenUnfreezeModal = (item: FreezeItem) => {
    setSelectedFreezeItem(item)
    setIsUnfreezeModalOpen(true)
  }

  const handleCloseUnfreezeModal = () => {
    setIsUnfreezeModalOpen(false)
    setSelectedFreezeItem(null)
  }

  return {
    dataSource,
    totalElements,
    page,
    pageSize,
    filter,
    handleChangePage,
    refetch,
    isFetching,
    handleSearch,
    clearFilters,
    isLoading,
    isUnfreezeModalOpen,
    selectedFreezeItem,
    handleOpenUnfreezeModal,
    handleCloseUnfreezeModal,
    handleExport,
    isExporting,
  }
}

export default useFrozenTransactions
