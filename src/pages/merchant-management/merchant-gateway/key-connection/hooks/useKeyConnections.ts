import { useMemo, useState } from 'react'

import type { ListState } from '../../shared/merchantGateway.types'
import { KEY_CONNECTION_FIXTURE } from '../constants/keyConnection.fixture'
import type { KeyConnectionFormValues } from '../schemas/keyConnection.schema'
import type {
  KeyConnectionFilters,
  KeyConnectionRow
} from '../types/keyConnection.type'

const PAGE_SIZE = 10
const DEFAULT_FILTERS: KeyConnectionFilters = {
  query: '',
  scope: 'ALL',
  status: 'ALL'
}

const matchesFilters = (
  row: KeyConnectionRow,
  filters: KeyConnectionFilters
): boolean => {
  const query = filters.query.trim().toLowerCase()
  const searchText = [row.merchantName, row.merchantCode, row.clientId]
    .join(' ')
    .toLowerCase()

  return (
    (query === '' || searchText.includes(query)) &&
    (filters.scope === 'ALL' || row.scope === filters.scope) &&
    (filters.status === 'ALL' || row.status === filters.status)
  )
}

const upsertKeyConnection = (
  rows: KeyConnectionRow[],
  record: KeyConnectionFormValues & { id?: string }
): KeyConnectionRow[] => {
  const existing = rows.find((row) => row.id === record.id)
  const nextRecord: KeyConnectionRow = {
    ...record,
    id: record.id ?? `key-${crypto.randomUUID()}`,
    merchantName: existing?.merchantName ?? record.merchantCode,
    updatedAt: new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date())
  }

  return existing
    ? rows.map((row) => (row.id === nextRecord.id ? nextRecord : row))
    : [nextRecord, ...rows]
}

export function useKeyConnections() {
  const [records, setRecords] = useState<KeyConnectionRow[]>([
    ...KEY_CONNECTION_FIXTURE
  ])
  const [filters, setFilterState] = useState<KeyConnectionFilters>(
    DEFAULT_FILTERS
  )
  const [page, setCurrentPage] = useState(1)

  const filteredRows = useMemo(
    () => records.filter((row) => matchesFilters(row, filters)),
    [filters, records]
  )
  const rows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const listState: ListState = filteredRows.length === 0 ? 'empty' : 'success'

  const setFilters = (nextFilters: KeyConnectionFilters): void => {
    setFilterState(nextFilters)
    setCurrentPage(1)
  }

  const setPage = (nextPage: number): void => {
    setCurrentPage(Math.max(1, nextPage))
  }

  const save = (record: KeyConnectionFormValues & { id?: string }): void => {
    setRecords((current) => upsertKeyConnection(current, record))
  }

  const toggleStatus = (id: string): void => {
    setRecords((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
            }
          : row
      )
    )
  }

  const retry = (): void => {
    setRecords((current) => [...current])
  }

  return {
    rows,
    total: filteredRows.length,
    page,
    pageSize: PAGE_SIZE,
    filters,
    listState,
    setFilters,
    setPage,
    save,
    toggleStatus,
    retry
  }
}
