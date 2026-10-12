import { skipToken } from '@reduxjs/toolkit/query'
import { usePreviewRefundFeeQuery } from '@services/apiRefund'
import useDebounce from '@hooks/useDebounce'
import type {
  RefundChannel,
  RefundPreview
} from '@pages/transaction-management/refund-management/schemas/refund.schema'
import { getRefundErrorText } from '@pages/transaction-management/refund-management/utils/refund.utils'

export const REFUND_PREVIEW_DEBOUNCE_MS = 400

interface UseRefundFeePreviewArgs {
  transactionId: string | null | undefined
  channel: RefundChannel | null
  bankCode: string | null
  amount: number | undefined
}

export interface RefundFeePreviewState {
  /** Chưa có số tiền hợp lệ (> 0, số nguyên) nên chưa gọi. */
  isIdle: boolean
  /** Lần tải đầu, chưa có số cũ để giữ. */
  isLoading: boolean
  /** Đang chờ debounce hoặc response mới: giữ số cũ và làm mờ. */
  isStale: boolean
  errorMessage: string
  preview: RefundPreview | undefined
}

const isValidAmount = (amount: number | undefined): amount is number =>
  amount !== undefined && Number.isInteger(amount) && amount > 0

/**
 * Xem trước phí theo số tiền/kênh/ngân hàng. Chỉ số tiền được debounce; kênh và ngân
 * hàng đổi hiếm nên gọi ngay. Query theo arg nên response của arg cũ về muộn bị bỏ qua.
 */
export const useRefundFeePreview = ({
  transactionId,
  channel,
  bankCode,
  amount
}: UseRefundFeePreviewArgs): RefundFeePreviewState => {
  const debouncedAmount = useDebounce(amount, REFUND_PREVIEW_DEBOUNCE_MS)
  const canCall = Boolean(transactionId && channel) && isValidAmount(amount)
  const requestAmount = isValidAmount(debouncedAmount) ? debouncedAmount : null
  const request =
    requestAmount !== null && transactionId && channel
      ? {
          originalTransactionId: transactionId,
          requestedAmount: requestAmount,
          channel,
          beneficiaryBankCode: channel === 'TO_BANK' ? bankCode : null
        }
      : skipToken
  const { data, error, isFetching } = usePreviewRefundFeeQuery(request)

  return {
    isIdle: !canCall,
    isLoading: isFetching && !data,
    isStale: canCall && (isFetching || debouncedAmount !== amount),
    errorMessage: canCall && error ? getRefundErrorText(error) : '',
    preview: canCall && !error ? data : undefined
  }
}
