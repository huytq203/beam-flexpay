import { useMemo, useState } from 'react'

import usePagination from '@hooks/usePagination'
import { useGetAccountQuery } from '@services/apiWalletAccount.api'

import type { BusinessWalletSearchValues } from '../schemas/business-wallet.schema'
import {
  BUSINESS_WALLET_TYPE,
  type BusinessWalletRow
} from '../types/business-wallet.type'

const normalizeFilters = (
  values: BusinessWalletSearchValues
): BusinessWalletSearchValues => ({
  username: values.username?.trim() || undefined,
  ownerId: values.ownerId?.trim() || undefined,
  status: values.status
})

export function useBusinessWallet() {
  const { page, size, setPage, setPageSize } = usePagination()
  const [filters, setFilters] = useState<BusinessWalletSearchValues>({})

  const query = useGetAccountQuery({
    ...filters,
    page,
    size,
    walletType: BUSINESS_WALLET_TYPE
  })

  const rows = useMemo<BusinessWalletRow[]>(
    () =>
      query.data?.content.map((account, index) => ({
        ...account,
        no: (page - 1) * size + index + 1
      })) ?? [],
    [page, query.data, size]
  )

  const handleSearch = (values: BusinessWalletSearchValues): void => {
    setFilters(normalizeFilters(values))
    setPage(1)
  }

  const handlePageChange = (nextPage: number, nextPageSize: number): void => {
    setPage(nextPage)
    setPageSize(nextPageSize)
  }

  return {
    rows,
    totalElements: query.data?.totalElements ?? 0,
    page,
    size,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    handleSearch,
    handlePageChange,
    refetch: query.refetch
  }
}
