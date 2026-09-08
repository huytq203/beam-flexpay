import {
  useGetWithdrawalByTransactionCodeQuery,
  type WithdrawalDetail
} from '@services/apiJournal'
import { isWithdrawalSettling } from '@utils/withdrawal-approval'
import {
  SETTLEMENT_POLL_INTERVAL_MS,
  useSettlementWatch
} from './useSettlementWatch'

export interface WithdrawalStatusApi {
  withdrawal?: WithdrawalDetail
  status: string | null
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  /** Đang trong cửa sổ tự kiểm tra lại sau khi lệnh được duyệt. */
  isWatching: boolean
  refetch: () => void
}

/**
 * Đọc trạng thái lệnh rút từ user-wallet và tự theo dõi tiếp khi lệnh đã duyệt
 * nhưng chưa ghi sổ.
 *
 * Chỉ biết có cần poll hay không **sau** khi đã đọc được trạng thái, nên việc
 * bật poll nằm ở một subscription thứ hai vào đúng endpoint đó. RTK Query gộp
 * hai subscription về cùng một cache entry, nên đây là bật/tắt poll chứ không
 * phải gọi API hai lần. Poll dừng khi tab mất focus — ca vận hành mở hàng chục
 * tab, không có lý do để tab nền vẫn gọi API.
 */
export const useWithdrawalStatus = (
  transactionCode: string,
  skip = false
): WithdrawalStatusApi => {
  const isDisabled = skip || !transactionCode

  const { data, isLoading, isFetching, isError, refetch } =
    useGetWithdrawalByTransactionCodeQuery(transactionCode, {
      skip: isDisabled
    })

  const { isWatching } = useSettlementWatch(
    isWithdrawalSettling(data?.status),
    transactionCode
  )

  useGetWithdrawalByTransactionCodeQuery(transactionCode, {
    skip: isDisabled || !isWatching,
    pollingInterval: SETTLEMENT_POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true
  })

  return {
    withdrawal: data,
    status: data?.status ?? null,
    isLoading,
    isFetching,
    isError,
    isWatching,
    refetch: () => void refetch()
  }
}
