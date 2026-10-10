import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormTextArea } from '@components/form'
import { DialogModal } from '@components/index'
import { RefundDialogFooter } from '@pages/transaction-management/refund-management/components/RefundDialogFooter'
import { RefundNote } from '@pages/transaction-management/refund-management/components/RefundNote'
import { REVIEW_REASON_MAX } from '../constants/transactionReview.constant'
import { useReviewActions } from '../hooks/useReviewActions'
import {
  markReviewSchema,
  type MarkReviewValues
} from '../schemas/transactionReview.schema'

interface MarkReviewDialogProps {
  transactionCode: string
  canRefresh: boolean
  onClose: () => void
}

const FORM_ID = 'mark-review-form'

export function MarkReviewDialog({
  transactionCode,
  canRefresh,
  onClose
}: MarkReviewDialogProps) {
  const { mark, isMarking } = useReviewActions(transactionCode, canRefresh)
  const [error, setError] = useState('')
  const { control, handleSubmit } = useForm<MarkReviewValues>({
    resolver: zodResolver(markReviewSchema),
    defaultValues: { reason: '' }
  })

  const onSubmit = async ({ reason }: MarkReviewValues): Promise<void> => {
    if (isMarking) return
    setError('')
    const result = await mark(reason)
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title='Đánh dấu Review'
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
        <RefundNote tone='info'>
          Giao dịch <strong>{transactionCode}</strong> chuyển sang Review. Job
          tự động và callback ngân hàng không chốt lệnh, khách vẫn thấy đang xử
          lý. Người duyệt phải khác bạn.
        </RefundNote>
        <FormTextArea<MarkReviewValues>
          control={control}
          name='reason'
          label='Lý do review'
          required
          rows={3}
          maxLength={REVIEW_REASON_MAX}
          placeholder='10 đến 500 ký tự'
          className='flex flex-col gap-1'
        />
        {error && <RefundNote tone='danger'>{error}</RefundNote>}
      </form>
      <RefundDialogFooter
        formId={FORM_ID}
        okText='Đánh dấu Review'
        loading={isMarking}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
