import { Controller, type Control } from 'react-hook-form'

import { cn } from '@utils/cn'

import type { BankAccountFormValues } from '../schemas/bank-account.schema'
import { WithdrawMode } from '../types/bank-account.type'

const MODES = [
  {
    value: WithdrawMode.MANUAL,
    title: 'Thủ công',
    description: 'Merchant tự tạo lệnh rút'
  },
  {
    value: WithdrawMode.AUTO,
    title: 'Tự động theo chu kỳ',
    description: 'Hệ thống tạo lệnh rút T+n'
  }
]

interface WithdrawModeFieldProps {
  control: Control<BankAccountFormValues>
}

export function WithdrawModeField({ control }: WithdrawModeFieldProps) {
  return (
    <Controller
      control={control}
      name='withdrawMode'
      render={({ field }) => (
        <fieldset className='md:col-span-2'>
          <legend className='mb-1.5 text-sm font-medium text-foreground'>
            Hình thức rút tiền
          </legend>
          <div className='flex flex-col gap-3 sm:flex-row'>
            {MODES.map((mode) => {
              const isSelected = field.value === mode.value

              return (
                <label
                  key={mode.value}
                  className={cn(
                    'flex flex-1 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/60'
                  )}
                >
                  <input
                    type='radio'
                    name={field.name}
                    value={mode.value}
                    checked={isSelected}
                    onChange={() => field.onChange(mode.value)}
                    onBlur={field.onBlur}
                    className='mt-0.5 size-4 shrink-0 accent-primary'
                  />
                  <span className='flex flex-col gap-0.5'>
                    <span className='text-sm font-semibold text-foreground'>
                      {mode.title}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {mode.description}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )}
    />
  )
}
