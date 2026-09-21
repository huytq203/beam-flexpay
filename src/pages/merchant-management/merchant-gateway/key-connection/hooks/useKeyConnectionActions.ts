import { useState } from 'react'

import { KEY_CONNECTION_FIXTURE } from '../constants/keyConnection.fixture'
import type { KeyConnectionFormValues } from '../schemas/keyConnection.schema'
import type {
  KeyConnectionFilters,
  KeyConnectionRow
} from '../types/keyConnection.type'
import {
  DEFAULT_KEY_CONNECTION_FILTERS,
  toggleKeyConnectionStatus,
  upsertKeyConnection
} from '../utils/keyConnection.utils'

export function useKeyConnectionActions() {
  const [records, setRecords] = useState<KeyConnectionRow[]>([
    ...KEY_CONNECTION_FIXTURE
  ])
  const [filters, setFilterState] = useState<KeyConnectionFilters>(
    DEFAULT_KEY_CONNECTION_FILTERS
  )
  const [page, setPage] = useState(1)

  const setFilters = (nextFilters: KeyConnectionFilters): void => {
    setFilterState(nextFilters)
    setPage(1)
  }

  const save = (record: KeyConnectionFormValues & { id?: string }): void => {
    setRecords((current) => upsertKeyConnection(current, record))
  }

  return {
    records,
    filters,
    page,
    setFilters,
    setPage: (nextPage: number) => setPage(Math.max(1, nextPage)),
    save,
    toggleStatus: (id: string) =>
      setRecords((current) => toggleKeyConnectionStatus(current, id)),
    retry: () => setRecords((current) => [...current])
  }
}
