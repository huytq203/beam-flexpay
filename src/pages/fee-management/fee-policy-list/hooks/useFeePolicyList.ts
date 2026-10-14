import type { FeeScope } from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { useSearchFeePoliciesQuery } from '@services/apiFeePolicy.api'
import type { FeePolicy } from '@type/fee.type'
import { useMemo } from 'react'
import { splitPolicyStatusFilter } from '../utils/policyStatusFilter'

export interface FeePolicyListFilters {
  /** Luồng phí đang xem: chỉ lấy chính sách có thành phần thuộc luồng này. */
  feeScope: FeeScope
  keyword?: string
  subjectKeyword?: string
  serviceType?: string
  status?: string
  appliedTarget?: string
  bankCode?: string
  providerCode?: string
  paymentMethod?: string
  payerType?: string
  beneficiaryType?: string
  feeBearer?: string
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
 * Luồng phí là tiêu chí lọc ở backend nên tab gửi thẳng xuống API; miền phí chỉ còn
 * là nhãn phân loại và không tham gia lọc.
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
      feeScope: filters.feeScope,
      serviceType: filters.serviceType || undefined,
      ...splitPolicyStatusFilter(filters.status),
      appliedTarget: filters.appliedTarget || undefined,
      bankCode: filters.bankCode || undefined,
      providerCode: filters.providerCode || undefined,
      paymentMethod: filters.paymentMethod || undefined,
      payerType: filters.payerType || undefined,
      beneficiaryType: filters.beneficiaryType || undefined,
      feeBearer: filters.feeBearer || undefined,
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
