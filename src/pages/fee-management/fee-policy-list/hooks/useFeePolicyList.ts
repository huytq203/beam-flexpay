import type { FeeDomain } from '@components/fee/feeDomain'
import { useSearchFeePoliciesQuery } from '@services/apiFeePolicy.api'
import type { FeePolicy } from '@type/fee.type'
import { useMemo } from 'react'

export interface FeePolicyListFilters {
  feeDomain: FeeDomain
  keyword?: string
  subjectKeyword?: string
  serviceType?: string
  status?: string
  appliedTarget?: string
  bankCode?: string
  paymentMethod?: string
  validFrom?: string
  validTo?: string
  createdAtFrom?: string
  createdAtTo?: string
}

export interface FeePolicyRow extends FeePolicy {
  key: string
  no: number
}

interface UseFeePolicyListArgs {
  filters: FeePolicyListFilters
  page: number
  size: number
}

export interface UseFeePolicyListResult {
  rows: FeePolicyRow[]
  total: number
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Miền phí là tiêu chí lọc có sẵn ở backend nên tab gửi thẳng xuống API.
 *
 * Bộ lọc gửi thẳng một `serviceType` cụ thể; chiều tiền chỉ còn là thông tin
 * hiển thị của giao dịch và không tham gia truy vấn.
 */
export const useFeePolicyList = ({
  filters,
  page,
  size
}: UseFeePolicyListArgs): UseFeePolicyListResult => {
  const params = useMemo(
    () => ({
      keyword: filters.keyword || '',
      subjectKeyword: filters.subjectKeyword || undefined,
      feeDomain: filters.feeDomain,
      serviceType: filters.serviceType || undefined,
      status: filters.status || undefined,
      appliedTarget: filters.appliedTarget || undefined,
      bankCode: filters.bankCode || undefined,
      paymentMethod: filters.paymentMethod || undefined,
      validFrom: filters.validFrom || undefined,
      validTo: filters.validTo || undefined,
      createdAtFrom: filters.createdAtFrom || undefined,
      createdAtTo: filters.createdAtTo || undefined,
      includeConfiguration: true,
      page,
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    }),
    [filters, page, size]
  )

  const { data, isLoading, isFetching, isError, refetch } =
    useSearchFeePoliciesQuery(params)

  const rows = useMemo<FeePolicyRow[]>(
    () =>
      (data?.content ?? []).map((item: FeePolicy, index: number) => ({
        ...item,
        key: item.id,
        no: (page - 1) * size + index + 1
      })),
    [data, page, size]
  )

  return {
    rows,
    total: data?.totalElements ?? 0,
    isLoading,
    isFetching,
    isError,
    refetch
  }
}
