import type { Control } from 'react-hook-form'

import { FormField } from '@components/form'
import { InputNumber } from '@components/index'

import type { BankAccountFormValues } from '../schemas/bank-account.schema'

const groupSeparator = (value: string | number | undefined): string =>
  `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const toAmount = (value: string | undefined): number =>
  Number(value?.replace(/\D/g, '') || 0)

interface WithdrawLimitFieldProps {
  control: Control<BankAccountFormValues>
}

/** Hai ô min/max nằm chung một nhãn, đúng bố cục mockup. */
export function WithdrawLimitField({ control }: WithdrawLimitFieldProps) {
  return (
    <div className='flex flex-col gap-1.5 md:col-span-2'>
      <span className='text-sm font-medium text-foreground'>
        Hạn mức rút mỗi lệnh (min / max)
      </span>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
        <FormField
          control={control}
          name='minAmount'
          className='flex flex-col'
          render={(field) => (
            <InputNumber
              {...field}
              id={field.name}
              min={0}
              suffix='VNĐ'
              placeholder='Tối thiểu'
              aria-label='Hạn mức rút tối thiểu mỗi lệnh'
              className='tabular-nums'
              formatter={groupSeparator}
              parser={toAmount}
            />
          )}
        />
        <FormField
          control={control}
          name='maxAmount'
          className='flex flex-col'
          render={(field) => (
            <InputNumber
              {...field}
              id={field.name}
              min={0}
              suffix='VNĐ'
              placeholder='Tối đa'
              aria-label='Hạn mức rút tối đa mỗi lệnh'
              className='tabular-nums'
              formatter={groupSeparator}
              parser={toAmount}
            />
          )}
        />
      </div>
      <p className='text-xs text-muted-foreground'>
        Bỏ trống hoặc để 0 nếu không giới hạn chiều đó.
      </p>
    </div>
  )
}
