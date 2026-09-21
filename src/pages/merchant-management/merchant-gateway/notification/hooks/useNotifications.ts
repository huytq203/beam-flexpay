import { useMemo, useState } from 'react'

import type { ListState } from '../../shared/merchantGateway.types'
import { NOTIFICATION_FIXTURE } from '../constants/notification.fixture'
import type { NotificationFormValues } from '../schemas/notification.schema'
import type { NotificationFilters, NotificationRow } from '../types/notification.type'
import { DEFAULT_NOTIFICATION_FILTERS, filterNotifications, NOTIFICATION_PAGE_SIZE, upsertNotification } from '../utils/notification.utils'

export interface UseNotificationsOptions { initialListState?: ListState }

export function useNotifications({ initialListState }: UseNotificationsOptions = {}) {
  const [records, setRecords] = useState<NotificationRow[]>([...NOTIFICATION_FIXTURE])
  const [filters, setFilterState] = useState<NotificationFilters>(DEFAULT_NOTIFICATION_FILTERS)
  const [page, setPage] = useState(1)
  const filteredRows = useMemo(() => filterNotifications(records, filters), [records, filters])
  const listState = initialListState ?? (filteredRows.length ? 'success' : 'empty')
  const setFilters = (next: NotificationFilters) => { setFilterState(next); setPage(1) }
  const save = (values: NotificationFormValues & { id?: string }) => setRecords((current) => upsertNotification(current, values))
  const toggleStatus = (id: string) => setRecords((current) => current.map((row) => row.id === id ? { ...row, status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : row))

  return {
    filters, listState, page, pageSize: NOTIFICATION_PAGE_SIZE,
    rows: filteredRows.slice((page - 1) * NOTIFICATION_PAGE_SIZE, page * NOTIFICATION_PAGE_SIZE),
    total: filteredRows.length, save, setFilters, setPage, toggleStatus,
    retry: () => setRecords((current) => [...current])
  }
}
