import type { Control } from 'react-hook-form'
import { cn } from '@lib/utils/cn'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import type { StuckTransactionUpdateFormValues } from '@/components/transaction/StuckTransaction.schema'

import { BANK_CONFIRMATION_CHANNEL_OPTIONS } from '../constants/bankConfirmation.constants'

interface Props {
  control: Control<StuckTransactionUpdateFormValues>
  isSuccess: boolean
}

export const BankConfirmationFields = ({ control, isSuccess }: Props) => (
  <fieldset className='min-w-0 border-0 border-t border-border p-0 pt-5'>
    <legend className='float-left mb-4 w-full p-0 text-sm font-semibold text-foreground'>
      Xác nhận trực tiếp với ngân hàng
    </legend>
    <div className='clear-both grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2'>
      <FormSelect
        control={control}
        name='bankConfirmation.confirmationChannel'
        label='Kênh xác nhận'
        placeholder='Chọn kênh xác nhận'
        options={BANK_CONFIRMATION_CHANNEL_OPTIONS}
        required
        className='flex flex-col gap-1'
      />
      <FormInput
        control={control}
        name='bankConfirmation.confirmationReference'
        label='Tham chiếu xác nhận'
        placeholder='VD: mã email, mã yêu cầu hỗ trợ'
        maxLength={255}
        required
        className='flex flex-col gap-1'
      />
      <FormDatePicker
        control={control}
        id='bankConfirmation.confirmedAt'
        name='bankConfirmation.confirmedAt'
        label='Thời điểm xác nhận'
        placeholder='DD/MM/YYYY HH:mm:ss'
        showTime
        required
        className={cn('flex flex-col gap-1', !isSuccess && 'sm:col-span-2')}
      />
      {isSuccess && (
        <>
          <FormInput
            control={control}
            name='bankConfirmation.bankReference'
            label='Mã giao dịch ngân hàng'
            placeholder='VD: mã giao dịch trên sao kê'
            maxLength={255}
            required
            className='flex flex-col gap-1'
          />
          <FormDatePicker
            control={control}
            id='bankConfirmation.valueDate'
            name='bankConfirmation.valueDate'
            label='Ngày giá trị'
            placeholder='DD/MM/YYYY'
            required
            className='flex flex-col gap-1'
          />
          <FormDatePicker
            control={control}
            id='bankConfirmation.bankBookedAt'
            name='bankConfirmation.bankBookedAt'
            label='Thời điểm ngân hàng ghi sổ'
            placeholder='DD/MM/YYYY HH:mm:ss'
            showTime
            required
            className='flex flex-col gap-1'
          />
        </>
      )}
    </div>
  </fieldset>
)
