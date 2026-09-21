import { useMemo, useState } from 'react'

import type { ListState } from '../../shared/merchantGateway.types'
import { PAYMENT_METHOD_FIXTURE } from '../constants/paymentMethod.fixture'
import type { PaymentMethodFormValues } from '../schemas/paymentMethod.schema'
import type {
  PaymentMethodFilters,
  PaymentMethodRow
} from '../types/paymentMethod.type'

export const PAYMENT_METHOD_PAGE_SIZE = 10

export const DEFAULT_PAYMENT_METHOD_FILTERS: PaymentMethodFilters = {
  query: '',
  method: 'ALL',
  status: 'ALL'
}

const getUpdatedAt = (): string =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date())

const filterRows = (
  rows: PaymentMethodRow[],
  filters: PaymentMethodFilters
): PaymentMethodRow[] => {
  const query = filters.query.trim().toLowerCase()

  return rows.filter((row) => {
    const searchText = [row.merchantName, row.merchantCode].join(' ').toLowerCase()
    return (
      (query === '' || searchText.includes(query)) &&
      (filters.method === 'ALL' || row.method === filters.method) &&
      (filters.status === 'ALL' || row.status === filters.status)
    )
  })
}

const isFiltered = (filters: PaymentMethodFilters): boolean =>
  filters.query !== '' || filters.method !== 'ALL' || filters.status !== 'ALL'

const upsertRecord = (
  current: PaymentMethodRow[],
  record: PaymentMethodFormValues & { id?: string }
): PaymentMethodRow[] => {
  const existing = current.find((row) => row.id === record.id)
  const next: PaymentMethodRow = {
    ...record,
    id: record.id ?? `payment-${crypto.randomUUID()}`,
    merchantName: existing?.merchantName ?? record.merchantCode,
    updatedAt: getUpdatedAt()
  }

  return existing
    ? current.map((row) => (row.id === next.id ? next : row))
    : [next, ...current]
}

const toggleRecordStatus = (
  current: PaymentMethodRow[],
  id: string
): PaymentMethodRow[] =>
  current.map((row) =>
    row.id === id
      ? {
          ...row,
          status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
          updatedAt: getUpdatedAt()
        }
      : row
  )

export function usePaymentMethods(initialListState?: ListState) {
  const [records, setRecords] = useState<PaymentMethodRow[]>([...PAYMENT_METHOD_FIXTURE])
  const [filters, setFilterState] = useState<PaymentMethodFilters>(DEFAULT_PAYMENT_METHOD_FILTERS)
  const [page, setPageState] = useState(1)
  const [overrideState, setOverrideState] = useState<ListState | undefined>(initialListState)
  const filteredRows = useMemo(() => filterRows(records, filters), [filters, records])
  const rows = filteredRows.slice((page - 1) * PAYMENT_METHOD_PAGE_SIZE, page * PAYMENT_METHOD_PAGE_SIZE)
  const listState = overrideState ?? (filteredRows.length === 0 ? 'empty' : 'success')

  const setFilters = (nextFilters: PaymentMethodFilters): void => {
    setFilterState(nextFilters)
    setPageState(1)
  }

  const save = (record: PaymentMethodFormValues & { id?: string }): void => {
    setRecords((current) => upsertRecord(current, record))
  }

  const toggleStatus = (id: string): void => {
    setRecords((current) => toggleRecordStatus(current, id))
  }

  return {
    rows,
    total: filteredRows.length,
    page,
    pageSize: PAYMENT_METHOD_PAGE_SIZE,
    filters,
    filtered: isFiltered(filters),
    listState,
    setFilters,
    setPage: (nextPage: number) => setPageState(Math.max(1, nextPage)),
    save,
    toggleStatus,
    retry: () => setOverrideState(undefined)
  }
}
