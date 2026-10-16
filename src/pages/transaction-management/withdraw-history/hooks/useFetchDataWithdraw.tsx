import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  useExportTransactionsMutation,
  type ExportTransactionsQuery
} from '@services/apiExportCsv'
import { useGetUnifiedQuery } from '@services/apiJournal'
import { WithdrawSearchValues } from '../components/WithdrawHistorySearch'
import { DEFAULT_WITHDRAW_TRANSACTION_TYPE } from '../constants/WithdrawHistory.constant'

export const WITHDRAW_FILTER_KEYS = [
  'keyword',
  'transactionCode',
  'status',
  'transactionType',
  'bankCode',
  'paymentMethod',
  'fromDate',
  'toDate',
  'successFrom',
  'successTo'
] as const

export type WithdrawFilterKey = (typeof WITHDRAW_FILTER_KEYS)[number]
// Ô từ khóa nhận cả SĐT khách hàng nên không đưa lên URL (rule 05).
const WITHDRAW_SENSITIVE_KEYS: readonly WithdrawFilterKey[] = ['keyword']
export type WithdrawFilters = Partial<Record<WithdrawFilterKey, string>>

/** Sắp theo ngày tạo mới nhất, như mặc định cũ của usePagination. */
const DEFAULT_SORT = { sortBy: 'createdAt', sortDirection: 'DESC' } as const

const trimFilters = (data: WithdrawSearchValues): WithdrawFilters => {
  const result: WithdrawFilters = {}
  for (const key of WITHDRAW_FILTER_KEYS) {
    const value = data[key]
    if (typeof value === 'string') result[key] = value.trim()
  }
  return result
}

/**
 * Map bộ lọc lưới sang params của `/wallet/transactions/export`. Lưới đổ từ
 * `/journal/unified` nhưng hai bên đi qua chung một object bộ lọc, nên bảng và
 * file không lệch nhau.
 */
const buildExportParams = (
  filter: WithdrawFilters,
  transactionType: string
): ExportTransactionsQuery => {
  const p: ExportTransactionsQuery = { type: transactionType }

  if (filter.keyword) p.keyword = filter.keyword
  if (filter.transactionCode) p.transactionCode = filter.transactionCode
  if (filter.status) p.status = filter.status
  if (filter.bankCode) p.bankCode = filter.bankCode
  if (filter.paymentMethod) p.paymentMethod = filter.paymentMethod
  if (filter.fromDate) p.fromDate = filter.fromDate
  if (filter.toDate) p.toDate = filter.toDate
  if (filter.successFrom) p.successFrom = filter.successFrom
  if (filter.successTo) p.successTo = filter.successTo

  return p
}

const useFetchDataWithdraw = () => {
  const {
    filters: searchParams,
    applyFilters,
    clearFilters,
    page,
    size: pageSize,
    setPage,
    setPageSize
  } = useUrlFilters<WithdrawFilterKey>({
    keys: WITHDRAW_FILTER_KEYS,
    sensitiveKeys: WITHDRAW_SENSITIVE_KEYS
  })

  // Ô "Loại giao dịch rút" để trống thì màn vẫn phải ghim về nhóm rút.
  const transactionType =
    searchParams.transactionType || DEFAULT_WITHDRAW_TRANSACTION_TYPE


  const payload = {
    page,
    size: pageSize,
    ...DEFAULT_SORT,
    ...searchParams,
    transactionType,
    includeSummary: true
  }

  const {
    data: dataWithdraw,
    isLoading: isLoadingWithdraw,
    isFetching,
    refetch
  } = useGetUnifiedQuery(payload)

  const [triggerExport, { reset: resetExport }] = useExportTransactionsMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'lich-su-rut-tien'
  })

  const handleExport = () => {
    void exportFile(buildExportParams(searchParams, transactionType))
  }

  const dataSource = dataWithdraw?.content.map((item, index) => ({
    no: (page - 1) * pageSize + index + 1,
    ...item,
    key: item.id
  }))

  const handleSearch = (data: WithdrawSearchValues) =>
    applyFilters(trimFilters(data))

  const handleSummaryStatusChange = (status?: string) =>
    applyFilters({ ...searchParams, status })

  const handleChangePage = (nextPage: number, nextSize: number) => {
    if (nextSize !== pageSize) setPageSize(nextSize)
    else setPage(nextPage)
  }

  return {
    dataWithdraw,
    isLoadingWithdraw,
    page,
    pageSize,
    handleChangePage,
    filters: searchParams,
    dataSource,
    handleSearch,
    clearFilters,
    activeStatus: searchParams.status,
    handleSummaryStatusChange,
    refetch,
    isFetching,
    handleExport,
    isExporting
  }
}

export default useFetchDataWithdraw
