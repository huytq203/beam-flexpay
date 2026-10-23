import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormTextArea } from '@components/form'
import { DialogModal } from '@components/index'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundTarget } from '../schemas/refund.schema'
import {
  REASON_MAX,
  rejectRefundSchema,
  type RejectRefundValues
} from '../schemas/refundForm.schema'
import { RefundDialogFooter } from './RefundDialogFooter'
import { RefundNote } from './RefundNote'
import { RefundSummary } from './RefundSummary'

interface RejectRefundPayoutDialogProps {
  refund: RefundTarget
  onClose: () => void
}

const FORM_ID = 'reject-refund-payout-form'

/** Kế toán từ chối chi: yêu cầu hoàn bị từ chối và khoản tiền đang giữ được nhả (lý do bắt buộc). */
export function RejectRefundPayoutDialog({
  refund,
  onClose
}: RejectRefundPayoutDialogProps) {
  const { rejectPayout, isRejectingPayout } = useRefundActions()
  const [error, setError] = useState('')
  const { control, handleSubmit } = useForm<RejectRefundValues>({
    resolver: zodResolver(rejectRefundSchema),
    defaultValues: { reason: '' }
  })

  const onSubmit = async ({ reason }: RejectRefundValues): Promise<void> => {
    setError('')
    const result = await rejectPayout(refund.id, reason)
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title='Từ chối chi hoàn tiền'
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
        <FormTextArea<RejectRefundValues>
          control={control}
          name='reason'
          label='Lý do từ chối chi'
          required
          rows={3}
          maxLength={REASON_MAX}
          placeholder='Nhập lý do ...'
          className='flex flex-col gap-1'
        />
        <RefundNote tone='info'>
          Từ chối chi sẽ đóng yêu cầu hoàn tiền (Đã từ chối) và nhả khoản tiền
          đang giữ.
        </RefundNote>
        {error && <RefundNote tone='danger'>{error}</RefundNote>}
      </form>
      <RefundDialogFooter
        danger
        formId={FORM_ID}
        okText='Từ chối chi'
        loading={isRejectingPayout}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
