import { useState } from 'react'
import { useGetAuditLogsQuery } from '@/app/services/auditLogApi'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  AUDIT_DEFAULT_PAGE_SIZE,
  AUDIT_FILTER_KEYS,
  EMPTY_AUDIT_FILTERS,
  type AuditFilterKey
} from '../constants/auditLog.constants'
import type {
  AuditLogFilterErrors,
  AuditLogFilters
} from '../types/auditLog.types'
import {
  fromUrlFilters,
  hasAnyFilter,
  toFilterQuery,
  toUrlFilters,
  validateFilters
} from '../utils/auditLog.utils'

export function useAuditLogList() {
  const url = useUrlFilters<AuditFilterKey>({
    keys: AUDIT_FILTER_KEYS,
    defaultSize: AUDIT_DEFAULT_PAGE_SIZE,
    storageKey: 'audit-log:list'
  })
  const applied = fromUrlFilters(url.filters)
  const [draft, setDraft] = useState<AuditLogFilters>(applied)
  const [errors, setErrors] = useState<AuditLogFilterErrors>({})
  const filterQuery = toFilterQuery(applied)
  const query = useGetAuditLogsQuery({
    page: url.page,
    size: url.size,
    ...filterQuery
  })

  return {
    draft,
    setDraft: (next: AuditLogFilters): void => {
      setDraft(next)
      setErrors({})
    },
    errors,
    filterQuery,
    page: url.page,
    pageSize: url.size,
    setPagination: url.setPagination,
    query,
    records: query.data?.content ?? [],
    total: query.data?.totalElements ?? 0,
    canClear: hasAnyFilter(draft) || hasAnyFilter(applied),
    apply: (): void => {
      const found = validateFilters(draft)
      setErrors(found)
      if (Object.keys(found).length === 0) url.applyFilters(toUrlFilters(draft))
    },
    reset: (): void => {
      setDraft({ ...EMPTY_AUDIT_FILTERS })
      setErrors({})
      url.clearFilters()
    }
  }
}
