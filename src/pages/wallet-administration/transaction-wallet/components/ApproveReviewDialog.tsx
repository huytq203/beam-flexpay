import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { FormInput, FormTextArea } from '@components/form'
import { DialogModal } from '@components/index'
import { BankConfirmationFields } from '@pages/transaction-management/stuck-transaction/components/BankConfirmationFields'
import { RefundDialogFooter } from '@pages/transaction-management/refund-management/components/RefundDialogFooter'
import { RefundNote } from '@pages/transaction-management/refund-management/components/RefundNote'
import {
  EMPTY_BANK_CONFIRMATION,
  REVIEW_CODE_MAX,
  REVIEW_NOTE_MAX
} from '../constants/transactionReview.constant'
import { toApproveArg } from '../dto/transactionReview.dto'
import { useReviewActions } from '../hooks/useReviewActions'
import {
  createApproveReviewSchema,
  type ApproveReviewValues
} from '../schemas/transactionReview.schema'

interface ApproveReviewDialogProps {
  transactionCode: string
  /** Theo `requiredFields` của hành động REVIEW_APPROVE trong snapshot. */
  requireBankConfirmation: boolean
  canRefresh: boolean
  onClose: () => void
}

const FORM_ID = 'approve-review-form'

export function ApproveReviewDialog({
  transactionCode,
  requireBankConfirmation,
  canRefresh,
  onClose
}: ApproveReviewDialogProps) {
  const { approve, isApproving } = useReviewActions(transactionCode, canRefresh)
  const [error, setError] = useState('')
  const form = useForm<ApproveReviewValues>({
    resolver: zodResolver(createApproveReviewSchema(requireBankConfirmation)),
    defaultValues: {
      authCode: '',
      settlementId: '',
      note: '',
      bankConfirmation: EMPTY_BANK_CONFIRMATION
    }
  })

  const onSubmit = async (values: ApproveReviewValues): Promise<void> => {
    if (isApproving) return
    setError('')
    const result = await approve(toApproveArg(values, requireBankConfirmation))
    if (result.ok) onClose()
    else setError(result.message)
  }

  return (
    <DialogModal
      open
      title='Duyệt giao dịch sau review'
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
          <RefundNote tone='info'>
            Duyệt giao dịch <strong>{transactionCode}</strong> sẽ ghi có vào ví
            của khách qua sổ cái.
          </RefundNote>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <FormInput<ApproveReviewValues>
              control={form.control}
              name='authCode'
              label='Mã chuẩn chi'
              required
              maxLength={REVIEW_CODE_MAX}
              className='flex flex-col gap-1'
            />
            <FormInput<ApproveReviewValues>
              control={form.control}
              name='settlementId'
              label='Mã đối soát'
              required
              maxLength={REVIEW_CODE_MAX}
              className='flex flex-col gap-1'
            />
          </div>
          <FormTextArea<ApproveReviewValues>
            control={form.control}
            name='note'
            label='Ghi chú'
            rows={2}
            maxLength={REVIEW_NOTE_MAX}
            placeholder='Bỏ trống thì hệ thống ghi "Duyệt giao dịch sau review"'
            className='flex flex-col gap-1'
          />
          {requireBankConfirmation ? (
            <BankConfirmationFields isSuccess />
          ) : (
            <RefundNote tone='info'>
              Hệ thống đã lưu bằng chứng ngân hàng thành công cho lệnh này,
              không cần nhập lại.
            </RefundNote>
          )}
          {error && <RefundNote tone='danger'>{error}</RefundNote>}
        </form>
      </FormProvider>
      <RefundDialogFooter
        formId={FORM_ID}
        okText='Duyệt giao dịch'
        loading={isApproving}
        onCancel={onClose}
      />
    </DialogModal>
  )
}
