import { useMemo, useState } from 'react'
import {
  useListMerchantGroupsQuery,
  useListMerchantUsersQuery
} from '@/app/services/merchantAccessApi'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { toMerchantRole, toMerchantUser } from '../dto/merchantAccess.api'
import {
  EMPTY_FILTERS,
  USER_FILTER_KEYS,
  USER_SENSITIVE_KEYS,
  type UserFilterKey,
  type UserFilters
} from '../constants/merchantUserList.constants'
import {
  fromUserUrlFilters,
  toUserUrlFilters
} from '../utils/merchantUserFilters.utils'

export function useMerchantUserListData() {
  const url = useUrlFilters<UserFilterKey>({
    keys: USER_FILTER_KEYS,
    sensitiveKeys: USER_SENSITIVE_KEYS
  })
  const filters = fromUserUrlFilters(url.filters)
  const { page, size: pageSize } = url
  const [draft, setDraft] = useState<UserFilters>(filters)
  const usersQuery = useListMerchantUsersQuery({
    page,
    size: pageSize,
    query: filters.query || undefined,
    merchantId: filters.merchantId,
    status: filters.status
  })
  const rolesQuery = useListMerchantGroupsQuery({ page: 1, size: 100 })
  const users = useMemo(
    () => (usersQuery.data?.content ?? []).map(toMerchantUser),
    [usersQuery.data]
  )
  const roles = useMemo(
    () => (rolesQuery.data?.content ?? []).map(toMerchantRole),
    [rolesQuery.data]
  )

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const query = filters.query.trim().toLocaleLowerCase('vi-VN')
        return (
          (!query ||
            [user.name, user.email, user.phone].some((value) =>
              value.toLocaleLowerCase('vi-VN').includes(query)
            )) &&
          (!filters.merchantId ||
            user.merchantIds.includes(filters.merchantId)) &&
          (!filters.subMerchantId ||
            user.subMerchantIds.includes(filters.subMerchantId)) &&
          (filters.roleIds.length === 0 ||
            filters.roleIds.some((id) => user.roleIds.includes(id))) &&
          (!filters.status || user.status === filters.status) &&
          (!filters.scope ||
            (filters.scope === 'single'
              ? user.merchantIds.length === 1
              : user.merchantIds.length > 1))
        )
      }),
    [users, filters]
  )

  const apply = (): void => url.applyFilters(toUserUrlFilters(draft))
  const reset = (): void => {
    setDraft(EMPTY_FILTERS)
    url.clearFilters()
  }
  return {
    draft,
    setDraft,
    page,
    setPage: url.setPage,
    pageSize,
    setPageSize: url.setPageSize,
    usersQuery,
    users,
    roles,
    filteredUsers,
    apply,
    reset
  }
}
