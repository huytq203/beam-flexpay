import { useMemo, useState } from 'react'
import { useListMerchantGroupsQuery } from '@/app/services/merchantAccessApi'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { toMerchantRole } from '../dto/merchantAccess.api'
import { type RoleFilters } from '../components/MerchantRoleFilters'

const EMPTY_ROLE_FILTERS: RoleFilters = { query: '' }
const ROLE_FILTER_KEYS = ['query', 'merchantId', 'scope'] as const
type RoleFilterKey = (typeof ROLE_FILTER_KEYS)[number]

const toRoleFilters = (
  raw: Partial<Record<RoleFilterKey, string>>
): RoleFilters => ({
  query: raw.query ?? '',
  merchantId: raw.merchantId,
  scope:
    raw.scope === 'shared' || raw.scope === 'custom' ? raw.scope : undefined
})

export function useMerchantRoleListData() {
  const url = useUrlFilters<RoleFilterKey>({ keys: ROLE_FILTER_KEYS })
  const filters = toRoleFilters(url.filters)
  const { page, size: pageSize } = url
  const [draft, setDraft] = useState<RoleFilters>(filters)
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
  const apply = (): void =>
    url.applyFilters({ ...draft, query: draft.query.trim() })
  const reset = (): void => {
    setDraft(EMPTY_ROLE_FILTERS)
    url.clearFilters()
  }
  return {
    draft,
    setDraft,
    page,
    setPage: url.setPage,
    pageSize,
    setPageSize: url.setPageSize,
    rolesQuery,
    roles,
    filteredRoles,
    apply,
    reset
  }
}
