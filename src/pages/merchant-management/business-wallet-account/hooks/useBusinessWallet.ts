import { useMemo } from 'react'

import { useUrlFilters } from '@hooks/useUrlFilters'
import { useListEnterpriseWalletsQuery } from '@services/merchantEnterpriseWalletApi'

import {
  BUSINESS_WALLET_FILTER_KEYS,
  BUSINESS_WALLET_SENSITIVE_KEYS,
  type BusinessWalletFilterKey
} from '../constants/businessWallet.constants'
import {
  businessWalletSearchSchema,
  type BusinessWalletSearchValues
} from '../schemas/business-wallet.schema'
import type { BusinessWalletRow } from '../types/business-wallet.type'

type UrlValues = Partial<Record<BusinessWalletFilterKey, string>>

const normalizeFilters = (
  values: BusinessWalletSearchValues
): BusinessWalletSearchValues => ({
  query: values.query?.trim() || undefined,
  taxCode: values.taxCode?.trim() || undefined,
  verificationStatus: values.verificationStatus
})

// Giá trị trên URL người dùng sửa được: trạng thái lạ thì bỏ, không gửi xuống API.
const toSearchValues = (values: UrlValues): BusinessWalletSearchValues => {
  const status = businessWalletSearchSchema.shape.verificationStatus.safeParse(
    values.verificationStatus
  )
  return {
    query: values.query,
    taxCode: values.taxCode,
    verificationStatus: status.success ? status.data : undefined
  }
}

export function useBusinessWallet() {
  const url = useUrlFilters<BusinessWalletFilterKey>({
    keys: BUSINESS_WALLET_FILTER_KEYS,
    sensitiveKeys: BUSINESS_WALLET_SENSITIVE_KEYS
  })
  const { page, size } = url
  const filters = toSearchValues(url.filters)

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
    url.applyFilters(normalizeFilters(values))
  }

  // Gọi cả setPage lẫn setPageSize trong cùng một lần đổi sẽ ghi đè lẫn nhau.
  const handlePageChange = (nextPage: number, nextPageSize: number): void => {
    if (nextPageSize !== size) url.setPageSize(nextPageSize)
    else url.setPage(nextPage)
  }

  return {
    rows,
    totalElements: query.data?.totalElements ?? 0,
    page,
    size,
    filters,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    handleSearch,
    handleClear: url.clearFilters,
    handlePageChange,
    refetch: query.refetch
  }
}
