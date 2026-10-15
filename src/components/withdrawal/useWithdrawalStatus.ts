import {
  useGetWithdrawalByTransactionCodeQuery,
  type WithdrawalDetail
} from '@services/apiJournal'

export interface WithdrawalStatusApi {
  withdrawal?: WithdrawalDetail
  status: string | null
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Đọc trạng thái lệnh rút từ user-wallet. Không tự poll: người dùng bấm Tải lại
 * để lấy trạng thái mới nhất.
 */
export const useWithdrawalStatus = (
  transactionCode: string,
  skip = false
): WithdrawalStatusApi => {
  const isDisabled = skip || !transactionCode

  const { data, isLoading, isFetching, isError, refetch } =
    useGetWithdrawalByTransactionCodeQuery(transactionCode, {
      skip: isDisabled,
      // Detail đã nạp cache trước khi mount panel; không gọi lại cùng endpoint.
      refetchOnMountOrArgChange: false
    })

  return {
    withdrawal: data,
    status: data?.status ?? null,
    isLoading,
    isFetching,
    isError,
    refetch: () => void refetch()
  }
}
