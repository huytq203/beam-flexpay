import type { PolicyKind } from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { useSearchFeePoliciesQuery } from '@services/apiFeePolicy.api'
import type { FeePolicy } from '@type/fee.type'
import { useMemo } from 'react'
import { splitPolicyStatusFilter } from '../utils/policyStatusFilter'

export interface FeePolicyListFilters {
  /** Loại chính sách đang xem: tab đầu ra = CUSTOMER_FEE, tab đầu vào = INPUT_COST. */
  policyKind: PolicyKind
  /** Miền phí cố định của màn; chỉ màn ĐVCNTT đặt (`MERCHANT`), màn chung để trống và không gửi. */
  feeDomain?: string
  keyword?: string
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
 * Mỗi màn chọn `policyKind` và gửi thẳng xuống API (backend lọc theo loại chính sách). Miền phí chỉ tham gia
 * lọc khi màn đặt `feeDomain` cố định (màn ĐVCNTT); màn chung không gửi.
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
      policyKind: filters.policyKind,
      feeDomain: filters.feeDomain || undefined,
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
