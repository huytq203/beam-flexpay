import { useMemo, useState } from 'react'
import {
  useListMerchantGroupsQuery,
  useListMerchantUsersQuery
} from '@/app/services/merchantAccessApi'
import { toMerchantRole, toMerchantUser } from '../dto/merchantAccess.api'
import {
  EMPTY_FILTERS,
  type UserFilters
} from '../constants/merchantUserList.constants'

export function useMerchantUserListData() {
  const [draft, setDraft] = useState<UserFilters>(EMPTY_FILTERS)
  const [filters, setFilters] = useState<UserFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
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

  const apply = (): void => {
    setFilters({ ...draft, query: draft.query.trim() })
    setPage(1)
  }
  const reset = (): void => {
    setDraft(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }
  return {
    draft,
    setDraft,
    page,
    setPage,
    pageSize,
    setPageSize,
    usersQuery,
    users,
    roles,
    filteredUsers,
    apply,
    reset
  }
}
