import { useListBankAccountChangeRequestsQuery } from '@/app/services/merchantBankAccountApi'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  CHANGE_REQUEST_FILTER_KEYS,
  CHANGE_REQUEST_PAGE_SIZE,
  CHANGE_REQUEST_STATUS_OPTIONS,
  DEFAULT_CHANGE_REQUEST_STATUS,
  type ChangeRequestFilterKey
} from '../constants/bankAccountChangeRequest.constants'

/** Hàng đợi yêu cầu đổi tài khoản; mặc định chỉ hiện yêu cầu chờ duyệt. */
export const useBankAccountChangeRequests = () => {
  const url = useUrlFilters<ChangeRequestFilterKey>({
    keys: CHANGE_REQUEST_FILTER_KEYS,
    defaultSize: CHANGE_REQUEST_PAGE_SIZE,
    storageKey: 'bank-account:change-requests'
  })
  // Giá trị lạ trên URL bị bỏ: BE trả 400 với status không hợp lệ.
  const status =
    CHANGE_REQUEST_STATUS_OPTIONS.find(
      (option) => option.value === url.filters.status
    )?.value ?? DEFAULT_CHANGE_REQUEST_STATUS
  const query = useListBankAccountChangeRequestsQuery({
    page: url.page,
    size: url.size,
    status
  })

  return {
    page: url.page,
    size: url.size,
    status,
    query,
    setStatus: (next?: typeof status): void =>
      url.applyFilters({ status: next }),
    changePage: (nextPage: number, nextSize: number): void => {
      if (nextSize !== url.size) url.setPageSize(nextSize)
      else url.setPage(nextPage)
    }
  }
}
