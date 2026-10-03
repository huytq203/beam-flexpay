import { BankConfirmationFields } from '@pages/transaction-management/stuck-transaction/components/BankConfirmationFields'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonComponent } from '@components/index'
import {
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextArea
} from '@components/form'
import {
  STUCK_TRANSACTION_OUTCOME,
  STUCK_UPDATE_CODE_MAX_LENGTH,
  STUCK_UPDATE_NOTE_MAX_LENGTH,
  StuckTransactionOutcome
} from '@type/stuckTransaction.type'
import {
  createStuckTransactionUpdateSchema,
  type StuckTransactionUpdateFormValues
} from './StuckTransaction.schema'

const OUTCOME_OPTIONS = [
  StuckTransactionOutcome.POSTED,
  StuckTransactionOutcome.FAILED
].map((outcome) => ({
  value: outcome,
  label: STUCK_TRANSACTION_OUTCOME[outcome].label
}))

export interface StuckTransactionUpdateFormProps {
  transactionCode: string
  isCashOut?: boolean
  allowBankConfirmation?: boolean
  requireBankConfirmation?: boolean
  isSubmitting?: boolean
  submissionError?: string | null
  onSubmit: (values: StuckTransactionUpdateFormValues) => void
  onCancel: () => void
}

export const StuckTransactionUpdateForm = ({
  transactionCode,
  isCashOut = false,
  allowBankConfirmation = true,
  requireBankConfirmation = false,
  isSubmitting,
  submissionError,
  onSubmit,
  onCancel
}: StuckTransactionUpdateFormProps) => {
  const { control, handleSubmit } = useForm<StuckTransactionUpdateFormValues>({
    resolver: zodResolver(
      createStuckTransactionUpdateSchema(
        requireBankConfirmation && allowBankConfirmation
      )
    ),
    mode: 'onSubmit',
    defaultValues: {
      authCode: '',
      settlementId: '',
      note: '',
      includeBankConfirmation: false,
      bankConfirmation: {
        confirmationChannel: '',
        confirmationReference: '',
        confirmedAt: '',
        bankReference: '',
        valueDate: '',
        bankBookedAt: ''
      }
    }
  })

  const includeBankConfirmation = useWatch({
    control,
    name: 'includeBankConfirmation'
  })
  const newStatus = useWatch({ control, name: 'newStatus' })
  const isSuccess = newStatus === StuckTransactionOutcome.POSTED

  return (
    <form
      className='flex min-w-0 flex-col gap-4 pt-2'
      onSubmit={handleSubmit(onSubmit)}
    >
      <p className='m-0 min-w-0 text-sm leading-5 break-words text-muted-foreground'>
        Giao dịch{' '}
        <span className='font-medium text-foreground'>{transactionCode}</span> ·
        Kết quả cuối không thể sửa sau khi chốt.
      </p>

      {isCashOut && (
        <section
          aria-labelledby='bank-check-heading'
          className='rounded-lg border border-border bg-muted/40 p-3'
        >
          <h3
            id='bank-check-heading'
            className='m-0 text-sm font-semibold text-foreground'
          >
            Bước 1 · Đối chiếu ngân hàng
          </h3>
          <p className='mt-1 text-sm leading-5 text-muted-foreground'>
            Kiểm tra bằng chứng chi tiền và trạng thái tại hệ thống ngân hàng
            trước khi chốt. Thao tác này không tự kiểm tra lại ngân hàng.
          </p>
        </section>
      )}

      <h3 className='m-0 text-sm font-semibold text-foreground'>
        {isCashOut ? 'Bước 2 · Chốt kết quả' : 'Chốt kết quả'}
      </h3>

      <FormSelect
        control={control}
        name='newStatus'
        label='Kết quả cuối'
        required
        className='flex flex-col gap-1'
        placeholder='Chọn kết quả'
        options={OUTCOME_OPTIONS}
      />

    

      {isSuccess && (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <FormInput
            control={control}
            name='authCode'
            label='Auth Code (không bắt buộc)'
            className='flex flex-col gap-1'
            placeholder='VD: AUTH123456'
            maxLength={STUCK_UPDATE_CODE_MAX_LENGTH}
          />
          <FormInput
            control={control}
            name='settlementId'
            label='Settlement ID (không bắt buộc)'
            className='flex flex-col gap-1'
            placeholder='VD: STL20260825001'
            maxLength={STUCK_UPDATE_CODE_MAX_LENGTH}
          />
        </div>
      )}

      {allowBankConfirmation && (
        <>
          {!requireBankConfirmation && (
            <FormCheckbox
              control={control}
              name='includeBankConfirmation'
              label='Bổ sung xác nhận trực tiếp với ngân hàng'
              disabled={isSubmitting}
            />
          )}
          {(requireBankConfirmation || includeBankConfirmation) && (
            <BankConfirmationFields
              control={control}
              isSuccess={isSuccess}
            />
          )}
        </>
      )}

      <FormTextArea
        control={control}
        name='note'
        label='Lý do cập nhật'
        required
        className='flex flex-col gap-1'
        rows={3}
        maxLength={STUCK_UPDATE_NOTE_MAX_LENGTH}
        placeholder='Ví dụ: đối chiếu sao kê ngân hàng, giao dịch đã ghi có cho khách'
      />

      {submissionError && (
        <p
          role='alert'
          className='m-0 rounded-lg border border-danger-strong p-3 text-sm leading-5 text-danger-strong'
        >
          {submissionError}
        </p>
      )}

      <div className='grid grid-cols-1 gap-2 min-[400px]:grid-cols-2'>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Hủy bỏ'
          className='w-full pointer-coarse:h-11!'
          disabled={isSubmitting}
          onClick={onCancel}
        />
        <ButtonComponent
          htmlType='submit'
          type='primary'
          danger={newStatus === StuckTransactionOutcome.FAILED}
          content='Xác nhận cập nhật'
          className='w-full pointer-coarse:h-11!'
          loading={isSubmitting}
        />
      </div>
    </form>
  )
}
