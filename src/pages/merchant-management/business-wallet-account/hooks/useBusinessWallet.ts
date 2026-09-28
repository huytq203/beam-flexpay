import { useMemo, useState } from 'react'

import usePagination from '@hooks/usePagination'
import { useListEnterpriseWalletsQuery } from '@services/merchantEnterpriseWalletApi'

import type { BusinessWalletSearchValues } from '../schemas/business-wallet.schema'
import type { BusinessWalletRow } from '../types/business-wallet.type'

const normalizeFilters = (
  values: BusinessWalletSearchValues
): BusinessWalletSearchValues => ({
  query: values.query?.trim() || undefined,
  taxCode: values.taxCode?.trim() || undefined,
  verificationStatus: values.verificationStatus
})

export function useBusinessWallet() {
  const { page, size, setPage, setPageSize } = usePagination()
  const [filters, setFilters] = useState<BusinessWalletSearchValues>({})

  const query = useListEnterpriseWalletsQuery({
    ...filters,
    page: page - 1,
    size
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
