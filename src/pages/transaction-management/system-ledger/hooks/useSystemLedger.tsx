import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  useExportLedgerEntriesMutation,
  type ExportLedgerEntriesQuery
} from '@services/apiExportCsv'
import { useGetLedgerEntriesQuery } from '@services/apiSystemLedger'
import type { FormSearchValues } from '@type/systemLedger'
import { groupLedgerByJournal } from '../utils/groupLedgerByJournal'
import {
  LEDGER_FILTER_KEYS,
  LEDGER_SENSITIVE_KEYS,
  toLedgerFilter,
  toLedgerUrlFilters,
  type LedgerFilterKey
} from '../utils/systemLedgerFilters'

const useSystemLedger = () => {
  const {
    filters: urlFilters,
    applyFilters,
    clearFilters,
    page,
    size: pageSize,
    setPage,
    setPageSize
  } = useUrlFilters<LedgerFilterKey>({
    keys: LEDGER_FILTER_KEYS,
    sensitiveKeys: LEDGER_SENSITIVE_KEYS
  })
  const filter = toLedgerFilter(urlFilters)

  const {
    data: dataLedger,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useGetLedgerEntriesQuery({
    page,
    size: pageSize,
    ...filter,
    includeSummary: true
  })

  const [triggerExport, { reset: resetExport }] =
    useExportLedgerEntriesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'so-cai'
  })

  /** Endpoint xuất không nhận page/size: file lấy trọn bộ lọc, không theo trang. */
  const handleExport = () => {
    const exportParams: ExportLedgerEntriesQuery = filter
    void exportFile(exportParams)
  }

  const handleSearch = (data: FormSearchValues) =>
    applyFilters(toLedgerUrlFilters(data))

  const handleSummaryDirectionChange = (direction?: string) =>
    applyFilters({ ...urlFilters, direction })

  const handleChangePage = (nextPage: number, nextSize: number) => {
    if (nextSize !== pageSize) setPageSize(nextSize)
    else setPage(nextPage)
  }

  // Dữ liệu cũ còn trong cache khi lần tải lại lỗi; không được trình bày nó như số mới.
  const dataSource = isError
    ? []
    : groupLedgerByJournal(dataLedger?.content ?? [], (page - 1) * pageSize)

  return {
    dataSource,
    totalElements: isError ? 0 : dataLedger?.totalElements,
    page,
    pageSize,
    handleChangePage,
    filter,
    handleSearch,
    clearFilters,
    summary: isError ? undefined : dataLedger?.summary,
    activeDirection: filter.direction,
    handleSummaryDirectionChange,
    refetch,
    isLoading,
    isFetching,
    isError,
    handleExport,
    isExporting
  }
}

export default useSystemLedger
