import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { FormInput, FormTextArea } from '@components/form'
import { ButtonComponent } from '@components/index'
import { StuckReceiptField } from '@components/transaction/StuckReceiptField'
import {
  MANUAL_PAYOUT_NOTE_MAX_LENGTH,
  MANUAL_PAYOUT_REFERENCE_MAX_LENGTH,
  ManualPayoutOutcome,
  isManualPayoutComplete,
  manualPayoutFormSchema,
  toManualPayoutSubmit,
  type ManualPayoutFormValues,
  type ManualPayoutSubmitValues
} from './manualPayout.utils'

export interface ManualPayoutFormProps {
  outcome: ManualPayoutOutcome
  /**
   * Mã giao dịch dùng để tải biên lai (`/transactions/{code}/receipt`): mã lệnh
   * rút, hoặc mã lệnh chi của yêu cầu hoàn. Vắng thì không tải được UNC nên
   * không chốt thành công được.
   */
  receiptTransactionCode: string | null
  isSubmitting: boolean
  /** Câu lỗi của lần gửi gần nhất; dialog giữ nguyên để người dùng sửa và gửi lại. */
  error: string | null
  /** Khối tóm tắt lệnh đặt trên đầu form. */
  summary?: ReactNode
  /** Câu nói trước hậu quả của lựa chọn. */
  consequence: ReactNode
  onSubmit: (values: ManualPayoutSubmitValues) => void
  onCancel: () => void
}

const OK_TEXT: Record<ManualPayoutOutcome, string> = {
  [ManualPayoutOutcome.SUCCESS]: 'Xác nhận chi thành công',
  [ManualPayoutOutcome.FAILED]: 'Xác nhận chi thất bại'
}

/**
 * Form chốt kết quả chi thủ công, dùng chung cho lệnh rút và lệnh chi hoàn.
 *
 * "Chi thành công" bắt buộc mã tham chiếu ngân hàng + ảnh biên lai (UNC) + lý do;
 * "Chi thất bại" chỉ cần lý do. Nút xác nhận bị khoá tới khi đủ dữ liệu — BE vẫn
 * kiểm tra lại, nhưng không để người vận hành bấm một lệnh chắc chắn bị từ chối.
 */
export const ManualPayoutForm = ({
  outcome,
  receiptTransactionCode,
  isSubmitting,
  error,
  summary,
  consequence,
  onSubmit,
  onCancel
}: ManualPayoutFormProps) => {
  const form = useForm<ManualPayoutFormValues>({
    resolver: zodResolver(manualPayoutFormSchema),
    defaultValues: { bankReference: '', receipt: undefined, note: '' }
  })
  const values = useWatch({ control: form.control })
  const isSuccess = outcome === ManualPayoutOutcome.SUCCESS
  const canSubmit = isManualPayoutComplete(outcome, values)

  const submit = form.handleSubmit((formValues) => {
    if (isSubmitting || !isManualPayoutComplete(outcome, formValues)) return
    onSubmit(toManualPayoutSubmit(outcome, formValues))
  })

  return (
    // FormProvider để `StuckReceiptField` ghi `receipt` vào chính form này.
    <FormProvider {...form}>
      <form
        noValidate
        className='flex min-w-0 flex-col gap-4'
        onSubmit={(event) => void submit(event)}
      >
        {summary}
        <p className='m-0 text-[13px] leading-5 break-words text-muted-foreground'>
          {consequence}
        </p>

        {isSuccess && (
          <div className='grid grid-cols-1 gap-4'>
            <FormInput<ManualPayoutFormValues>
              control={form.control}
              name='bankReference'
              label='Mã tham chiếu ngân hàng'
              required
              className='flex flex-col gap-1'
              placeholder='VD: FT26301ABCDE'
              maxLength={MANUAL_PAYOUT_REFERENCE_MAX_LENGTH}
              disabled={isSubmitting}
            />
            {receiptTransactionCode ? (
              <StuckReceiptField
                transactionCode={receiptTransactionCode}
                required
                disabled={isSubmitting}
              />
            ) : (
              <p
                role='alert'
                className='m-0 text-sm text-danger-strong'
              >
                Chưa có mã lệnh chi nên chưa tải được ảnh biên lai (UNC). Hãy
                tải lại màn hình rồi thử lại.
              </p>
            )}
          </div>
        )}

        <FormTextArea<ManualPayoutFormValues>
          control={form.control}
          name='note'
          label='Lý do'
          required
          rows={3}
          maxLength={MANUAL_PAYOUT_NOTE_MAX_LENGTH}
          showCount
          className='flex flex-col gap-1'
          placeholder={
            isSuccess
              ? 'VD: đã chuyển khoản tay qua internet banking, UNC đính kèm'
              : 'VD: ngân hàng trả lại lệnh chuyển khoản tay'
          }
          disabled={isSubmitting}
        />

        {error && (
          <p
            role='alert'
            className='m-0 text-sm break-words text-danger-strong'
          >
            {error}
          </p>
        )}

        <div className='flex justify-end gap-2'>
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Đóng'
            disabled={isSubmitting}
            onClick={onCancel}
          />
          <ButtonComponent
            htmlType='submit'
            type='primary'
            danger={!isSuccess}
            content={OK_TEXT[outcome]}
            loading={isSubmitting}
            disabled={!canSubmit}
          />
        </div>
      </form>
    </FormProvider>
  )
}
