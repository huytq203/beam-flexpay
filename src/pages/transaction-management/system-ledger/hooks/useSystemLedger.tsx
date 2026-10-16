import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  useExportLedgerEntriesMutation,
  type ExportLedgerEntriesQuery
} from '@services/apiExportCsv'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetLedgerEntriesQuery } from '../services/apiSystemLedger'
import { FormSearchValues, LedgerEntry } from '../types/SystemLedger.type'
import {
  LEDGER_FILTER_KEYS,
  LEDGER_SENSITIVE_KEYS,
  toLedgerFilter,
  toLedgerUrlFilters,
  type LedgerFilterKey
} from '../utils/systemLedgerFilters'

/**
 * Gom các dòng cùng bút toán lại cạnh nhau, Nợ trước Có. API sắp theo thời gian
 * ghi nên dòng Có (phí, người nhận) ghi sau dòng Nợ lại hiện lên trước. Chỉ xếp
 * lại trong trang đang xem — không đổi thứ tự giữa các bút toán.
 */
const groupByJournal = (entries: LedgerEntry[]): LedgerEntry[] => {
  const groups = new Map<string, LedgerEntry[]>()
  entries.forEach((entry) => {
    const key = entry.journalCode ?? `__${entry.id}`
    groups.set(key, [...(groups.get(key) ?? []), entry])
  })
  return [...groups.values()].flatMap((group) =>
    [...group].sort(
      (a, b) =>
        Number(b.direction === 'DEBIT') - Number(a.direction === 'DEBIT')
    )
  )
}

const useSystemLedger = () => {
  const navigate = useNavigate()
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

  const payload = {
    page,
    size: pageSize,
    ...filter,
    includeSummary: true
  }
  const {
    data: dataLedger,
    isFetching,
    refetch
  } = useGetLedgerEntriesQuery(payload)

  const [triggerExport, { reset: resetExport }] =
    useExportLedgerEntriesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'so-cai'
  })

  /** Endpoint xuất không nhận page/size — file lấy trọn bộ lọc, không theo trang. */
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

  const totalElements = dataLedger?.totalElements
  const dataSource = useMemo(
    () =>
      dataLedger?.content && groupByJournal(dataLedger.content).map((item, idx) => ({
        no: (page - 1) * pageSize + idx + 1,
        ...item
      })),
    [dataLedger, page, pageSize]
  )

  return {
    dataSource,
    totalElements,
    page,
    pageSize,
    handleChangePage,
    filter,
    navigate,
    handleSearch,
    clearFilters,
    summary: dataLedger?.summary,
    activeDirection: filter.direction,
    handleSummaryDirectionChange,
    refetch,
    isFetching,
    handleExport,
    isExporting
  }
}

export default useSystemLedger
