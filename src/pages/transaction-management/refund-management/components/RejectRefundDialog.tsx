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

interface RejectRefundDialogProps {
  refund: RefundTarget
  /** Từ chối chi (Kế toán) thay vì từ chối hoàn thường. */
  payout?: boolean
  onClose: () => void
}

const FORM_ID = 'reject-refund-form'

export function RejectRefundDialog({
  refund,
  payout,
  onClose
}: RejectRefundDialogProps) {
  const { reject, rejectRefundPayout, isRejecting, isRejectingPayout } =
    useRefundActions()
  const [error, setError] = useState('')
  const { control, handleSubmit } = useForm<RejectRefundValues>({
    resolver: zodResolver(rejectRefundSchema),
    defaultValues: { reason: '' }
  })

  const onSubmit = async ({ reason }: RejectRefundValues): Promise<void> => {
    setError('')
    const result = payout
      ? await rejectRefundPayout(refund.id, reason)
      : await reject(refund.id, reason)
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title={payout ? 'Từ chối chi hoàn tiền' : 'Từ chối yêu cầu hoàn tiền'}
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
          label='Lý do từ chối'
          required
          rows={3}
          maxLength={REASON_MAX}
          placeholder='Nhập lý do ...'
          className='flex flex-col gap-1'
        />
        <p className='text-xs text-muted-foreground'>
          {payout
            ? 'Yêu cầu chuyển sang Đã từ chối và khoản tiền đang giữ được nhả.'
            : 'Lý do được lưu cùng yêu cầu và hiển thị cho người tạo.'}
        </p>
        {error && <RefundNote tone='danger'>{error}</RefundNote>}
      </form>
      <RefundDialogFooter
        danger
        formId={FORM_ID}
        okText={payout ? 'Từ chối chi' : 'Từ chối'}
        loading={payout ? isRejectingPayout : isRejecting}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
