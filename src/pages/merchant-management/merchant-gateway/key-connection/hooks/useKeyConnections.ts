import { useMemo, useState } from 'react'

import type { ListState } from '../../shared/merchantGateway.types'
import { KEY_CONNECTION_FIXTURE } from '../constants/keyConnection.fixture'
import type { KeyConnectionFormValues } from '../schemas/keyConnection.schema'
import type {
  KeyConnectionFilters,
  KeyConnectionRow
} from '../types/keyConnection.type'
import {
  filterKeyConnections,
  KEY_CONNECTION_PAGE_SIZE,
  paginateKeyConnections,
  toggleKeyConnectionStatus,
  upsertKeyConnection
} from '../utils/keyConnection.utils'

const DEFAULT_FILTERS: KeyConnectionFilters = {
  query: '',
  scope: 'ALL',
  status: 'ALL'
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
    () => filterKeyConnections(records, filters),
    [filters, records]
  )
  const rows = paginateKeyConnections(filteredRows, page)
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
    setRecords((current) => toggleKeyConnectionStatus(current, id))
  }

  const retry = (): void => {
    setRecords((current) => [...current])
  }

  return {
    rows,
    total: filteredRows.length,
    page,
    pageSize: KEY_CONNECTION_PAGE_SIZE,
    filters,
    listState,
    setFilters,
    setPage,
    save,
    toggleStatus,
    retry
  }
}
