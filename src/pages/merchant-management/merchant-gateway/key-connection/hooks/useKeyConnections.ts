import { useMemo } from 'react'

import type { ListState } from '../../shared/merchantGateway.types'
import { useKeyConnectionActions } from './useKeyConnectionActions'
import {
  filterKeyConnections,
  KEY_CONNECTION_PAGE_SIZE,
  paginateKeyConnections
} from '../utils/keyConnection.utils'

export interface UseKeyConnectionsOptions {
  initialListState?: ListState
}

export function useKeyConnections(
  { initialListState }: UseKeyConnectionsOptions = {}
) {
  const actions = useKeyConnectionActions()
  const filteredRows = useMemo(
    () => filterKeyConnections(actions.records, actions.filters),
    [actions.filters, actions.records]
  )
  const listState =
    initialListState ?? (filteredRows.length === 0 ? 'empty' : 'success')

  return {
    rows: paginateKeyConnections(filteredRows, actions.page),
    total: filteredRows.length,
    page: actions.page,
    pageSize: KEY_CONNECTION_PAGE_SIZE,
    filters: actions.filters,
    listState,
    setFilters: actions.setFilters,
    setPage: actions.setPage,
    save: actions.save,
    toggleStatus: actions.toggleStatus,
    retry: actions.retry
  }
}
