import { useMemo, useState } from 'react'
import { useGetLedgerEntriesQuery } from '@services/apiSystemLedger'
import { groupLedgerByJournal } from '@pages/transaction-management/system-ledger/utils/groupLedgerByJournal'

const DEFAULT_PAGE_SIZE = 10

/** Sổ cái của đúng một tài khoản hệ thống: mỗi dòng là một lần cộng/trừ kèm số dư sau giao dịch. */
const useSystemAccountLedger = (accountId?: string) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE)

  const { data, isLoading, isFetching, isError, refetch } =
    useGetLedgerEntriesQuery({ page, size, accountId }, { skip: !accountId })

  const dataSource = useMemo(
    () => groupLedgerByJournal(data?.content ?? [], (page - 1) * size),
    [data, page, size]
  )

  const handleChangePage = (nextPage: number, nextSize: number) => {
    if (nextSize !== size) {
      setSize(nextSize)
      setPage(1)
    } else setPage(nextPage)
  }

  return {
    dataSource,
    totalElements: data?.totalElements ?? 0,
    page,
    size,
    handleChangePage,
    isLoading,
    isFetching,
    isError,
    refetch
  }
}

export default useSystemAccountLedger
