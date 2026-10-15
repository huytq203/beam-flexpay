import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { FormInput, FormRadio, FormTextArea } from '@components/form'
import { DialogModal } from '@components/index'
import { BankConfirmationFields } from '@pages/transaction-management/stuck-transaction/components/BankConfirmationFields'
import { RefundDialogFooter } from '@pages/transaction-management/refund-management/components/RefundDialogFooter'
import { RefundNote } from '@pages/transaction-management/refund-management/components/RefundNote'
import { ReviewRejectOption } from '@/app/schemas/transaction-review.schema'
import {
  EMPTY_BANK_CONFIRMATION,
  REVIEW_CODE_MAX,
  REVIEW_REASON_MAX,
  REVIEW_REJECT_OPTIONS
} from '../constants/transactionReview.constant'
import { toRejectArg } from '../dto/transactionReview.dto'
import { useReviewActions } from '../hooks/useReviewActions'
import {
  createRejectReviewSchema,
  type RejectReviewValues
} from '../schemas/transactionReview.schema'

interface RejectReviewDialogProps {
  transactionCode: string
  /** Theo `requiredFields` của hành động REVIEW_REJECT trong snapshot. */
  requireBankConfirmation: boolean
  canRefresh: boolean
  onClose: () => void
}

const FORM_ID = 'reject-review-form'

export function RejectReviewDialog({
  transactionCode,
  requireBankConfirmation,
  canRefresh,
  onClose
}: RejectReviewDialogProps) {
  const { reject, isRejecting } = useReviewActions(transactionCode, canRefresh)
  const [error, setError] = useState('')
  const form = useForm<RejectReviewValues>({
    resolver: zodResolver(createRejectReviewSchema(requireBankConfirmation)),
    defaultValues: {
      option: ReviewRejectOption.CANCEL_ONLY,
      reason: '',
      refundAuthCode: '',
      refundSettlementId: '',
      bankConfirmation: EMPTY_BANK_CONFIRMATION
    }
  })
  const option = useWatch({ control: form.control, name: 'option' })

  const onSubmit = async (values: RejectReviewValues): Promise<void> => {
    if (isRejecting) return
    setError('')
    const result = await reject(toRejectArg(values, requireBankConfirmation))
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title='Từ chối giao dịch sau review'
      width={{ xs: '100%', sm: 640 }}
      footer={null}
      onOk={onClose}
      onCancel={onClose}
    >
      <FormProvider {...form}>
        <form
          id={FORM_ID}
          noValidate
          className='flex flex-col gap-3'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormRadio<RejectReviewValues>
            control={form.control}
            name='option'
            label='Hình thức từ chối'
            options={[...REVIEW_REJECT_OPTIONS]}
            className='flex flex-col gap-1'
          />
          <FormTextArea<RejectReviewValues>
            control={form.control}
            name='reason'
            label='Lý do gửi khách hàng'
            required
            rows={3}
            maxLength={REVIEW_REASON_MAX}
            placeholder='10 đến 500 ký tự'
            className='flex flex-col gap-1'
          />
          <p className='-mt-2 text-xs text-muted-foreground'>
            Nội dung này được gửi cho khách làm lý do thất bại.
          </p>
          {option === ReviewRejectOption.REFUND && (
            <div className='flex flex-col gap-3 rounded-lg border border-border p-3'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <FormInput<RejectReviewValues>
                  control={form.control}
                  name='refundAuthCode'
                  label='Mã chuẩn chi (hoàn)'
                  required
                  maxLength={REVIEW_CODE_MAX}
                  className='flex flex-col gap-1'
                />
                <FormInput<RejectReviewValues>
                  control={form.control}
                  name='refundSettlementId'
                  label='Mã đối soát (hoàn)'
                  required
                  maxLength={REVIEW_CODE_MAX}
                  className='flex flex-col gap-1'
                />
              </div>
              <RefundNote tone='info'>
                Hệ thống sẽ chi tiền về tài khoản ngân hàng khách đã dùng để
                nạp. Không cộng số dư ví. Chỉ nên chọn khi đã xác nhận ngân hàng
                đã trừ tiền khách.
              </RefundNote>
            </div>
          )}
          {requireBankConfirmation && (
            <BankConfirmationFields isSuccess={false} />
          )}
          {error && <RefundNote tone='danger'>{error}</RefundNote>}
        </form>
      </FormProvider>
      <RefundDialogFooter
        danger
        formId={FORM_ID}
        okText='Từ chối giao dịch'
        loading={isRejecting}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
