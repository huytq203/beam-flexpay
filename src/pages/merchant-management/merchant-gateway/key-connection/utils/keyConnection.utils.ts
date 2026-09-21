import type { KeyConnectionFormValues } from '../schemas/keyConnection.schema'
import type {
  KeyConnectionFilters,
  KeyConnectionRow
} from '../types/keyConnection.type'

export const KEY_CONNECTION_PAGE_SIZE = 10

export const filterKeyConnections = (
  rows: KeyConnectionRow[],
  filters: KeyConnectionFilters
): KeyConnectionRow[] => {
  const query = filters.query.trim().toLowerCase()

  return rows.filter((row) => {
    const searchText = [row.merchantName, row.merchantCode, row.clientId]
      .join(' ')
      .toLowerCase()

    return (
      (query === '' || searchText.includes(query)) &&
      (filters.scope === 'ALL' || row.scope === filters.scope) &&
      (filters.status === 'ALL' || row.status === filters.status)
    )
  })
}

export const paginateKeyConnections = (
  rows: KeyConnectionRow[],
  page: number
): KeyConnectionRow[] =>
  rows.slice(
    (page - 1) * KEY_CONNECTION_PAGE_SIZE,
    page * KEY_CONNECTION_PAGE_SIZE
  )

const getUpdatedAt = (): string =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date())

export const upsertKeyConnection = (
  rows: KeyConnectionRow[],
  record: KeyConnectionFormValues & { id?: string }
): KeyConnectionRow[] => {
  const existing = rows.find((row) => row.id === record.id)
  const nextRecord: KeyConnectionRow = {
    ...record,
    id: record.id ?? `key-${crypto.randomUUID()}`,
    merchantName: existing?.merchantName ?? record.merchantCode,
    updatedAt: getUpdatedAt()
  }

  return existing
    ? rows.map((row) => (row.id === nextRecord.id ? nextRecord : row))
    : [nextRecord, ...rows]
}

export const toggleKeyConnectionStatus = (
  rows: KeyConnectionRow[],
  id: string
): KeyConnectionRow[] =>
  rows.map((row) =>
    row.id === id
      ? { ...row, status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
      : row
  )
