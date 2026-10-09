import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { Can } from '@/app/permissions'
import { FormField, FormInput } from '@components/form'
import { ButtonComponent, CardComponent, DateInput } from '@components/index'
import {
  specialMonthSchema,
  type SpecialMonthFormValues
} from '../schemas/specialMonth.schema'
import { useAddSpecialMonth } from '../hooks/useSpecialMonths'
import { getCurrentVietnamMonth } from '../utils/specialMonth.utils'

const MONTH_KEY_FORMAT = 'YYYY-MM'

export function SpecialMonthForm() {
  const { addMonth, isAdding } = useAddSpecialMonth()
  const [serverError, setServerError] = useState<string | null>(null)
  const { control, handleSubmit, reset } = useForm<SpecialMonthFormValues>({
    resolver: zodResolver(specialMonthSchema),
    defaultValues: { month: '', name: '' }
  })

  const submit = handleSubmit(async (values) => {
    setServerError(null)
    const error = await addMonth(values)
    if (error) {
      setServerError(error)
      return
    }
    reset()
  })

  const currentMonth = dayjs(getCurrentVietnamMonth(), MONTH_KEY_FORMAT)

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className='flex flex-col gap-4'
      >
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <FormField
            name='month'
            control={control}
            label='Tháng'
            required
            className='flex min-w-0 flex-col gap-2'
            classNameLable='font-medium'
            render={(field) => (
              <DateInput
                id={field.name}
                picker='month'
                format='MM/YYYY'
                placeholder='Chọn tháng'
                className='w-full'
                disabledDate={(date) => date.isBefore(currentMonth, 'month')}
                value={
                  field.value ? dayjs(field.value, MONTH_KEY_FORMAT) : null
                }
                onChange={(date) =>
                  field.onChange(date ? date.format(MONTH_KEY_FORMAT) : '')
                }
              />
            )}
          />
          <FormInput
            name='name'
            control={control}
            label='Tên tháng đặc biệt'
            required
            placeholder='Ví dụ: Tết Nguyên đán 2027'
            className='flex min-w-0 flex-col gap-2'
          />
        </div>
        {serverError && (
          <p
            role='alert'
            className='text-sm text-danger-strong'
          >
            {serverError}
          </p>
        )}
        <div className='flex justify-end'>
          <Can
            screen='WALLET_LIMIT_SPECIAL_MONTH'
            action='create'
          >
            <ButtonComponent
              htmlType='submit'
              loading={isAdding}
              content='Thêm tháng đặc biệt'
            />
          </Can>
        </div>
      </form>
    </CardComponent>
  )
}
