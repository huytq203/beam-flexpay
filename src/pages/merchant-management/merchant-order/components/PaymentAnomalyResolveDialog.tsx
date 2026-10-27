import { useState } from 'react'
import { useResolveMerchantPaymentAnomalyMutation } from '@/app/services/apiOrderMerchant.api'
import { DialogModal, TextArea, feedback } from '@components/index'
import { ANOMALY_REASON_LABELS } from '../constants/merchantOrder.constants'
import type { MerchantPaymentAnomaly } from '../types/merchantOrder.types'
import { describeOrderError } from '../utils/orderError.utils'
import { formatOrderMoney } from '../utils/merchantOrder.utils'

/** Trần của BE: `reason` tối đa 500 ký tự, sai trả 400 VALIDATION_ERROR. */
const REASON_MAX = 500

interface Props {
  anomaly: MerchantPaymentAnomaly
  onClose: () => void
}

/** Đánh dấu đã xử lý: chỉ đổi trạng thái, không ghi có hay hoàn tiền. */
export function PaymentAnomalyResolveDialog({ anomaly, onClose }: Props) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [resolve, { isLoading }] = useResolveMerchantPaymentAnomalyMutation()

  const submit = async (): Promise<void> => {
    const text = reason.trim()
    if (!text) return setError('Vui lòng nhập lý do xử lý')
    setError('')
    try {
      await resolve({ id: anomaly.id, body: { reason: text } }).unwrap()
      feedback.success('Đã đánh dấu khoản tiền về bất thường là Đã xử lý')
      onClose()
    } catch (failure) {
      // 409 (4329): khoản này đã được người khác xử lý; danh sách tự tải lại.
      const detail = describeOrderError(
        failure,
        'Không thể đánh dấu đã xử lý khoản tiền này'
      )
      setError(detail)
      feedback.error(detail)
    }
  }

  return (
    <DialogModal
      open
      mode='CONFIRM'
      title='Đánh dấu đã xử lý'
      okText='Đánh dấu đã xử lý'
      onOk={() => void submit()}
      onCancel={onClose}
      okButtonProps={{ loading: isLoading }}
    >
      <div className='space-y-3 text-sm'>
        <p>
          {ANOMALY_REASON_LABELS[anomaly.reason] ?? anomaly.reason} ·{' '}
          {formatOrderMoney(anomaly.amount)}
          {anomaly.orderCode && (
            <>
              {' '}
              · Đơn <strong>{anomaly.orderCode}</strong>
            </>
          )}
        </p>
        <p className='text-muted-foreground'>
          Chỉ chuyển trạng thái sang Đã xử lý và lưu lý do cùng người thao tác.
          Thao tác không ghi có hay hoàn tiền; hãy xử lý khoản tiền này xong rồi
          mới đánh dấu.
        </p>
        <div>
          <label
            htmlFor='payment-anomaly-resolve-reason'
            className='mb-1 block font-medium'
          >
            Lý do xử lý <span className='text-danger-strong'>*</span>
          </label>
          <TextArea
            id='payment-anomaly-resolve-reason'
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setError('')
            }}
            rows={3}
            maxLength={REASON_MAX}
            showCount
            placeholder='Ví dụ: Đã hoàn tiền cho khách ngày ...'
          />
        </div>
        {error && (
          <p
            role='alert'
            className='text-danger-strong'
          >
            {error}
          </p>
        )}
      </div>
    </DialogModal>
  )
}
