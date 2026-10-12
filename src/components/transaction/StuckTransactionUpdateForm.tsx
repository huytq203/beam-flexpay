import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonComponent } from '@components/index'
import { FormSelect, FormTextArea } from '@components/form'
import type { AllowedAction } from '@/app/schemas/transaction-review.schema'
import { useUploadStuckTransactionReceiptMutation } from '@services/apiStuckTransaction'
import {
  STUCK_TRANSACTION_OUTCOME,
  STUCK_UPDATE_NOTE_MAX_LENGTH,
  StuckTransactionOutcome
} from '@type/stuckTransaction.type'
import { StuckRefundFields } from './StuckRefundFields'
import { StuckSuccessFields } from './StuckSuccessFields'
import { receiptUploadCacheKey } from './stuckReceipt.utils'
import {
  stuckTransactionUpdateSchema,
  type StuckTransactionUpdateFormValues
} from './StuckTransaction.schema'

export interface StuckTransactionUpdateFormProps {
  transactionCode: string
  /** `allowedActions` POSTED/FAILED của snapshot: quyết định kết quả chọn được và trường hiển thị. */
  actions: readonly AllowedAction[]
  isSubmitting?: boolean
  onSubmit: (
    values: StuckTransactionUpdateFormValues,
    optionalFields: readonly string[]
  ) => void
  onCancel: () => void
}

const isOutcome = (status: unknown): status is StuckTransactionOutcome =>
  status === StuckTransactionOutcome.POSTED ||
  status === StuckTransactionOutcome.FAILED

export const StuckTransactionUpdateForm = ({
  transactionCode,
  actions,
  isSubmitting,
  onSubmit,
  onCancel
}: StuckTransactionUpdateFormProps) => {
  const form = useForm<StuckTransactionUpdateFormValues>({
    resolver: zodResolver(stuckTransactionUpdateSchema),
    mode: 'onSubmit',
    defaultValues: {
      authCode: '',
      settlementId: '',
      bankReference: '',
      note: '',
      refund: false,
      refundAuthCode: '',
      refundSettlementId: '',
      refundBankReference: ''
    }
  })
  const [, { isLoading: isUploading }] =
    useUploadStuckTransactionReceiptMutation({
      fixedCacheKey: receiptUploadCacheKey(transactionCode)
    })

  const { control, handleSubmit } = form
  const newStatus = useWatch({ control, name: 'newStatus' })
  const selected = actions.find((action) => action.status === newStatus)
  const optionalFields = selected?.optionalFields ?? []
  const options = actions
    .map((action) => action.status)
    .filter(isOutcome)
    .map((outcome) => ({
      value: outcome,
      label: STUCK_TRANSACTION_OUTCOME[outcome].label
    }))

  return (
    <FormProvider {...form}>
      <form
        className='flex min-w-0 flex-col gap-5'
        onSubmit={handleSubmit((values) => onSubmit(values, optionalFields))}
      >
        <FormSelect
          control={control}
          name='newStatus'
          label='Kết quả cuối'
          required
          className='flex flex-col gap-1'
          placeholder='Chọn kết quả'
          options={options}
        />

        {isOutcome(newStatus) && (
          <p className='m-0 text-sm leading-5 text-muted-foreground'>
            {STUCK_TRANSACTION_OUTCOME[newStatus].consequence}
          </p>
        )}

        {newStatus === StuckTransactionOutcome.POSTED && (
          <StuckSuccessFields
            control={control}
            transactionCode={transactionCode}
            optionalFields={optionalFields}
            isSubmitting={isSubmitting}
          />
        )}

        {newStatus === StuckTransactionOutcome.FAILED && (
          <StuckRefundFields
            control={control}
            optionalFields={optionalFields}
          />
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

        <div className='sticky bottom-0 z-10 grid grid-cols-1 gap-2 border-t border-border bg-background pt-3 min-[400px]:grid-cols-2'>
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
            disabled={isUploading}
          />
        </div>
      </form>
    </FormProvider>
  )
}
