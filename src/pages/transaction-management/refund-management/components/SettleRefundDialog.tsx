import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { FormRadio, FormTextArea } from '@components/form'
import { DialogModal } from '@components/index'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import {
  REASON_MAX,
  settleRefundSchema,
  type SettleRefundValues
} from '../schemas/refundForm.schema'
import { RefundDialogFooter } from './RefundDialogFooter'
import { RefundNote } from './RefundNote'
import { RefundSummary } from './RefundSummary'

interface SettleRefundDialogProps {
  refund: RefundTarget
  onClose: () => void
}

const FORM_ID = 'settle-refund-form'
const RESULT_OPTIONS = [
  { value: 'SUCCESS', label: 'Thành công' },
  { value: 'FAILED', label: 'Thất bại' }
]

export function SettleRefundDialog({
  refund,
  onClose
}: SettleRefundDialogProps) {
  const { settle, isSettling } = useRefundActions()
  const [error, setError] = useState('')
  const { control, handleSubmit } = useForm<SettleRefundValues>({
    resolver: zodResolver(settleRefundSchema),
    defaultValues: { result: 'SUCCESS', failureReason: '' }
  })
  const isFailed = useWatch({ control, name: 'result' }) === 'FAILED'

  const onSubmit = async (values: SettleRefundValues): Promise<void> => {
    setError('')
    const succeeded = values.result === 'SUCCESS'
    const result = await settle(
      refund.id,
      succeeded,
      succeeded ? undefined : values.failureReason
    )
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title='Quyết toán hoàn tiền'
      width={{ xs: '100%', sm: 520 }}
      footer={null}
      onOk={onClose}
      onCancel={onClose}
    >
      <form
        id={FORM_ID}
        noValidate
        className='flex flex-col gap-3'
        onSubmit={handleSubmit(onSubmit)}
      >
        <RefundSummary refund={refund} />
        <FormRadio<SettleRefundValues>
          control={control}
          name='result'
          label='Kết quả quyết toán'
          options={RESULT_OPTIONS}
          className='flex flex-col gap-1'
        />
        {isFailed && (
          <FormTextArea<SettleRefundValues>
            control={control}
            name='failureReason'
            label='Lý do thất bại'
            required
            rows={3}
            maxLength={REASON_MAX}
            placeholder='Bắt buộc 5 đến 500 ký tự'
            className='flex flex-col gap-1'
          />
        )}
        {isFailed && (
          <p className='text-xs text-muted-foreground'>
            Tiền giữ được nhả ra và yêu cầu quay về Chờ duyệt.
          </p>
        )}
        {error && <RefundNote tone='danger'>{error}</RefundNote>}
      </form>
      <RefundDialogFooter
        formId={FORM_ID}
        okText='Xác nhận quyết toán'
        loading={isSettling}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
