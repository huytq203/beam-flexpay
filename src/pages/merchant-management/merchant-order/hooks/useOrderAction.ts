import { useState } from 'react'
import {
  usePostMerchantOrderCancelMutation,
  usePostMerchantOrderConfirmMutation,
  usePostMerchantOrderRetryCreditMutation,
  usePostRefreshQrMutation
} from '@/app/services/apiOrderMerchant.api'
import { feedback } from '@components/index'
import type {
  MerchantOrder,
  OrderActionKind
} from '../types/merchantOrder.types'
import { describeOrderError } from '../utils/orderError.utils'

const FAILURE_FALLBACK: Record<OrderActionKind, string> = {
  confirm: 'Không thể xác nhận thanh toán thủ công',
  retry: 'Không thể ghi có lại đơn hàng',
  refresh: 'Không thể làm mới mã QR',
  cancel: 'Không thể hủy đơn hàng'
}

const SUCCESS_MESSAGE: Record<OrderActionKind, string> = {
  confirm: 'Đã xác nhận thanh toán và ghi có cho merchant',
  retry: 'Đã ghi có lại cho merchant',
  refresh: 'Đã làm mới mã QR',
  cancel: 'Đã hủy đơn hàng'
}

export interface OrderActionState {
  isLoading: boolean
  error: string
  /** Phản hồi HTTP 200 nhưng chưa ghi có xong: phải hiển thị cho người dùng. */
  creditWarning: MerchantOrder | null
  /** Kết quả làm mới QR, cần hiển thị mã mới. */
  qrResult: MerchantOrder | null
  run: (orderId: string, amount?: number) => Promise<void>
}

interface Options {
  kind: OrderActionKind
  onDone: () => void
}

/**
 * `confirm` và `retry-credit` nuốt lỗi ghi có và vẫn trả HTTP 200, nên thành
 * công chỉ khi `status === 'SUCCESS'`; các trạng thái khác giữ hộp thoại mở và
 * báo `creditFailureReason`.
 */
export function useOrderAction({ kind, onDone }: Options): OrderActionState {
  const [confirm, confirmState] = usePostMerchantOrderConfirmMutation()
  const [retry, retryState] = usePostMerchantOrderRetryCreditMutation()
  const [refresh, refreshState] = usePostRefreshQrMutation()
  const [cancel, cancelState] = usePostMerchantOrderCancelMutation()
  const [error, setError] = useState('')
  const [creditWarning, setCreditWarning] = useState<MerchantOrder | null>(null)
  const [qrResult, setQrResult] = useState<MerchantOrder | null>(null)
  const isLoading = [confirmState, retryState, refreshState, cancelState].some(
    (state) => state.isLoading
  )

  const run = async (orderId: string, amount?: number): Promise<void> => {
    setError('')
    try {
      if (kind === 'cancel') await cancel(orderId).unwrap()
      else if (kind === 'refresh') setQrResult(await refresh(orderId).unwrap())
      else {
        const order =
          kind === 'confirm'
            ? await confirm({
                id: orderId,
                body: { amount: amount ?? 0 }
              }).unwrap()
            : await retry(orderId).unwrap()
        if (order.status !== 'SUCCESS') {
          setCreditWarning(order)
          feedback.warning('Tiền đã ghi nhận nhưng chưa ghi có xong')
          return
        }
      }
      feedback.success(SUCCESS_MESSAGE[kind])
      if (kind !== 'refresh') onDone()
    } catch (failure) {
      const detail = describeOrderError(failure, FAILURE_FALLBACK[kind])
      setError(detail)
      feedback.error(detail)
    }
  }

  return { isLoading, error, creditWarning, qrResult, run }
}
