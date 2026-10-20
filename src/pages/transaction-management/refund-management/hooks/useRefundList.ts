import { useGetRefundsQuery } from '@services/apiRefund'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  REFUND_DEFAULT_PAGE_SIZE,
  REFUND_FILTER_KEYS,
  type RefundFilterKey
} from '../constants/refund.constants'
import { buildRefundParams, type RefundFilters } from '../utils/refund.utils'

export const useRefundList = () => {
  const url = useUrlFilters<RefundFilterKey>({
    keys: REFUND_FILTER_KEYS,
    defaultSize: REFUND_DEFAULT_PAGE_SIZE
  })
  const filters: RefundFilters = url.filters
  const query = useGetRefundsQuery(
    buildRefundParams(filters, url.page, url.size)
  )

  // Chip ghi `displayStatus`; xoá `status` của link cũ để hai bộ lọc không chồng nhau.
  const setStatus = (displayStatus: string): void =>
    url.applyFilters({ ...filters, status: undefined, displayStatus })

  return {
    filters,
    setStatus,
    page: url.page,
    pageSize: url.size,
    setPage: url.setPage,
    setPageSize: url.setPageSize,
    applyFilters: url.applyFilters,
    clearFilters: url.clearFilters,
    rows: query.data?.content ?? [],
    total: query.data?.totalElements ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch
  }
}
