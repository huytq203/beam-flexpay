import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import {
  useExportLedgerEntriesMutation,
  type ExportLedgerEntriesQuery
} from '@services/apiExportCsv'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetLedgerEntriesQuery } from '../services/apiSystemLedger'
import { FormSearchValues, LedgerEntry } from '../types/SystemLedger.type'

/** Ô để trống là "không lọc" — gửi chuỗi rỗng xuống API là gửi rác. */
const dropEmpty = (filter: FormSearchValues): FormSearchValues =>
  Object.fromEntries(
    Object.entries(filter).filter(
      ([, value]) => value !== '' && value !== undefined && value !== null
    )
  )

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
  const [filter, setFilter] = useState<FormSearchValues>({})
  const navigate = useNavigate()

  const { page, pageSize, setPage, setPageSize } = usePagination({
    defaultSort: 'createdAt'
  })

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
  const exportParams = useMemo<ExportLedgerEntriesQuery>(() => filter, [filter])

  const handleExport = useCallback(() => {
    void exportFile(exportParams)
  }, [exportFile, exportParams])

  const handleSearch = (data: FormSearchValues) => {
    const trimmed = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key as keyof FormSearchValues] =
        typeof value === 'string' ? value.trim() : value
      return acc
    }, {} as FormSearchValues)

    setFilter(dropEmpty(trimmed))
    setPage(1)
  }

  const handleSummaryDirectionChange = useCallback(
    (direction?: string) => {
      setFilter((currentFilter) => {
        const nextFilter = { ...currentFilter }

        if (direction) {
          nextFilter.direction = direction
        } else {
          delete nextFilter.direction
        }

        return nextFilter
      })
      setPage(1)
    },
    [setPage]
  )

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
    setPage,
    pageSize,
    setPageSize,
    navigate,
    handleSearch,
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
