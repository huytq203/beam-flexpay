import { useEffect, useMemo, useState } from 'react'

import usePagination from '@hooks/usePagination'

import { MOCK_BANK_ACCOUNTS } from '../constants/bank-account.constant'
import type { BankAccountSearchValues } from '../schemas/bank-account.schema'
import {
  BankAccountStatus,
  type BankAccountRow
} from '../types/bank-account.type'

const MOCK_LATENCY_MS = 400

const matchesKeyword = (row: BankAccountRow, keyword: string): boolean =>
  [
    row.merchantName,
    row.merchantCode,
    row.accountName,
    row.bankName,
    row.accountNumber
  ]
    .join(' ')
    .toLowerCase()
    .includes(keyword)

const filterRows = (
  rows: BankAccountRow[],
  filters: BankAccountSearchValues
): BankAccountRow[] => {
  const keyword = filters.keyword?.trim().toLowerCase() ?? ''

  return rows.filter(
    (row) =>
      (keyword === '' || matchesKeyword(row, keyword)) &&
      (!filters.scope || row.scope === filters.scope) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.linkStatus || row.linkStatus === filters.linkStatus)
  )
}

/**
 * Nguồn dữ liệu tạm cho phase dựng giao diện. Shape trả về khớp
 * `useBusinessWallet` để lần cắm API chỉ phải thay ruột hook này bằng
 * `useGetBankAccountsQuery`, không đụng tới component nào.
 */
export function useBankAccount() {
  const { page, size, setPage, setPageSize } = usePagination()
  const [records, setRecords] = useState<BankAccountRow[]>(MOCK_BANK_ACCOUNTS)
  const [filters, setFilters] = useState<BankAccountSearchValues>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), MOCK_LATENCY_MS)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(
    () => filterRows(records, filters),
    [filters, records]
  )
  const rows = filtered.slice((page - 1) * size, page * size)

  const handleSearch = (values: BankAccountSearchValues): void => {
    setFilters(values)
    setPage(1)
  }

  const handlePageChange = (nextPage: number, nextSize: number): void => {
    setPage(nextPage)
    setPageSize(nextSize)
  }

  const saveRecord = (row: BankAccountRow): void => {
    setRecords((current) =>
      current.some((item) => item.id === row.id)
        ? current.map((item) => (item.id === row.id ? row : item))
        : [row, ...current]
    )
  }

  const toggleStatus = (id: string): void => {
    setRecords((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === BankAccountStatus.ACTIVE
                  ? BankAccountStatus.INACTIVE
                  : BankAccountStatus.ACTIVE
            }
          : item
      )
    )
  }

  return {
    rows,
    totalElements: filtered.length,
    page,
    size,
    isLoading,
    isFetching: isLoading,
    isError: false,
    handleSearch,
    handlePageChange,
    refetch: () => setRecords((current) => [...current]),
    saveRecord,
    toggleStatus
  }
}
