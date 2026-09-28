import { useMemo, useState } from 'react'
import { useListMerchantGroupsQuery } from '@/app/services/merchantAccessApi'
import { toMerchantRole } from '../dto/merchantAccess.api'
import { type RoleFilters } from '../components/MerchantRoleFilters'

const EMPTY_ROLE_FILTERS: RoleFilters = { query: '' }

export function useMerchantRoleListData() {
  const [draft, setDraft] = useState<RoleFilters>(EMPTY_ROLE_FILTERS)
  const [filters, setFilters] = useState<RoleFilters>(EMPTY_ROLE_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const rolesQuery = useListMerchantGroupsQuery({
    page,
    size: pageSize,
    query: filters.query || undefined,
    merchantId: filters.merchantId,
    systemOnly: filters.scope === 'shared' ? true : undefined
  })
  const roles = useMemo(
    () => (rolesQuery.data?.content ?? []).map(toMerchantRole),
    [rolesQuery.data]
  )

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) => {
        const query = filters.query.trim().toLocaleLowerCase('vi-VN')
        return (
          (!query ||
            [role.name, role.description].some((value) =>
              value.toLocaleLowerCase('vi-VN').includes(query)
            )) &&
          (!filters.merchantId ||
            role.merchantId === null ||
            role.merchantId === filters.merchantId) &&
          (!filters.scope ||
            (filters.scope === 'shared'
              ? role.merchantId === null
              : role.merchantId !== null))
        )
      }),
    [roles, filters]
  )
  const apply = (): void => {
    setFilters({ ...draft, query: draft.query.trim() })
    setPage(1)
  }
  const reset = (): void => {
    setDraft(EMPTY_ROLE_FILTERS)
    setFilters(EMPTY_ROLE_FILTERS)
    setPage(1)
  }
  return {
    draft,
    setDraft,
    page,
    setPage,
    pageSize,
    setPageSize,
    rolesQuery,
    roles,
    filteredRoles,
    apply,
    reset
  }
}
