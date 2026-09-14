import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect, FormTextArea } from '@components/form'
import {
  STUCK_TRANSACTION_OUTCOME,
  STUCK_UPDATE_CODE_MAX_LENGTH,
  STUCK_UPDATE_NOTE_MAX_LENGTH,
  StuckTransactionOutcome
} from '@type/stuckTransaction.type'
import {
  stuckTransactionUpdateSchema,
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
  isSubmitting?: boolean
  onSubmit: (values: StuckTransactionUpdateFormValues) => void
  onCancel: () => void
}

export const StuckTransactionUpdateForm = ({
  transactionCode,
  isSubmitting,
  onSubmit,
  onCancel
}: StuckTransactionUpdateFormProps) => {
  const { control, handleSubmit } = useForm<StuckTransactionUpdateFormValues>({
    resolver: zodResolver(stuckTransactionUpdateSchema),
    mode: 'onSubmit',
    defaultValues: { authCode: '', settlementId: '', note: '' }
  })

  const newStatus = useWatch({ control, name: 'newStatus' })
  const isSuccess = newStatus === StuckTransactionOutcome.POSTED
  const consequence = newStatus
    ? STUCK_TRANSACTION_OUTCOME[newStatus].consequence
    : null

  return (
    <form
      className='flex min-w-0 flex-col gap-4 pt-2'
      onSubmit={handleSubmit(onSubmit)}
    >
      <p className='m-0 min-w-0 text-[13px] leading-5 break-words text-muted-foreground'>
        Chốt kết quả cuối cho giao dịch{' '}
        <span className='font-medium text-foreground'>{transactionCode}</span>.
        Giao dịch đã có kết quả cuối thì không sửa lại được.
      </p>

      <FormSelect
        control={control}
        name='newStatus'
        label='Kết quả cuối'
        required
        className='flex flex-col gap-1'
        placeholder='Chọn kết quả'
        options={OUTCOME_OPTIONS}
      />

      {consequence && (
        <p
          aria-live='polite'
          className='m-0 min-w-0 rounded-lg border border-border bg-muted/40 p-3 text-[13px] leading-5 break-words text-foreground'
        >
          {consequence}
        </p>
      )}

      {isSuccess && (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <FormInput
            control={control}
            name='authCode'
            label='Auth Code'
            className='flex flex-col gap-1'
            placeholder='VD: AUTH123456'
            maxLength={STUCK_UPDATE_CODE_MAX_LENGTH}
          />
          <FormInput
            control={control}
            name='settlementId'
            label='Settlement ID'
            className='flex flex-col gap-1'
            placeholder='VD: STL20260825001'
            maxLength={STUCK_UPDATE_CODE_MAX_LENGTH}
          />
        </div>
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
