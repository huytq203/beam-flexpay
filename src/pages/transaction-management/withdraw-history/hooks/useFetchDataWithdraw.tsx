import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import {
  useExportTransactionsMutation,
  type ExportTransactionsQuery
} from '@services/apiExportCsv'
import { useGetUnifiedQuery } from '@services/apiJournal'
import { useCallback, useMemo, useState } from 'react'
import { WithdrawSearchValues } from '../components/WithdrawHistorySearch'
import { DEFAULT_WITHDRAW_TRANSACTION_TYPE } from '../constants/WithdrawHistory.constant'

const dropEmpty = (
  filter: Partial<WithdrawSearchValues>
): Partial<WithdrawSearchValues> =>
  Object.fromEntries(
    Object.entries(filter).filter(
      ([, v]) => v !== '' && v !== undefined && v !== null
    )
  )

/**
 * Map bộ lọc lưới sang params của `/wallet/transactions/export`. Lưới đổ từ
 * `/journal/unified` nhưng hai bên đi qua chung một object bộ lọc, nên bảng và
 * file không lệch nhau.
 */
const buildExportParams = (
  filter: Partial<WithdrawSearchValues>,
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
  const { page, pageSize, setPage, setPageSize, sort, sortBy } = usePagination()
  const [searchParams, setSearchParams] = useState<
    Partial<WithdrawSearchValues>
  >({})

  // Ô "Loại giao dịch rút" để trống thì màn vẫn phải ghim về nhóm rút.
  const transactionType =
    searchParams.transactionType || DEFAULT_WITHDRAW_TRANSACTION_TYPE

  const payload = {
    page,
    pageSize,
    sortBy: sort,
    sortDirection: sortBy,
    ...dropEmpty(searchParams),
    transactionType
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

  const exportParams = useMemo(
    () => buildExportParams(searchParams, transactionType),
    [searchParams, transactionType]
  )

  const handleExport = useCallback(() => {
    void exportFile(exportParams)
  }, [exportFile, exportParams])

  const dataSource = dataWithdraw?.content.map((item, index) => ({
    no: (page - 1) * pageSize + index + 1,
    ...item,
    key: item.id
  }))

  const handleSearch = (data: WithdrawSearchValues) => {
    const trimmedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key as keyof WithdrawSearchValues] =
        typeof value === 'string' ? value.trim() : value
      return acc
    }, {} as WithdrawSearchValues)

    setSearchParams(dropEmpty(trimmedData))
    setPage(1)
  }

  return {
    dataWithdraw,
    isLoadingWithdraw,
    setPage,
    setPageSize,
    sort,
    sortBy,
    dataSource,
    handleSearch,
    refetch,
    isFetching,
    handleExport,
    isExporting
  }
}

export default useFetchDataWithdraw
