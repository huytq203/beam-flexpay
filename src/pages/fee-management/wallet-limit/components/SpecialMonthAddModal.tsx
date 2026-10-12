import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { FormField, FormInput } from '@components/form'
import { DateInput, ModalComponent } from '@components/index'
import {
  specialMonthSchema,
  type SpecialMonthFormValues
} from '../schemas/specialMonth.schema'
import { useAddSpecialMonth } from '../hooks/useSpecialMonths'
import { getCurrentVietnamMonth } from '../utils/specialMonth.utils'

const MONTH_KEY_FORMAT = 'YYYY-MM'

interface SpecialMonthAddModalProps {
  /** `yyyy-MM` điền sẵn khi mở từ ô trống trên lịch năm. */
  initialMonth?: string
  onClose: () => void
}

// Mount mỗi lần mở nên form luôn sạch và nhận đúng tháng điền sẵn.
export function SpecialMonthAddModal({
  initialMonth,
  onClose
}: SpecialMonthAddModalProps) {
  const { addMonth, isAdding } = useAddSpecialMonth()
  const [serverError, setServerError] = useState<string | null>(null)
  const { control, handleSubmit } = useForm<SpecialMonthFormValues>({
    resolver: zodResolver(specialMonthSchema),
    defaultValues: { month: initialMonth ?? '', name: '' }
  })

  const submit = handleSubmit(async (values) => {
    setServerError(null)
    const error = await addMonth(values)
    if (error) {
      setServerError(error)
      return
    }
    onClose()
  })

  const currentMonth = dayjs(getCurrentVietnamMonth(), MONTH_KEY_FORMAT)

  return (
    <ModalComponent
      open
      width={480}
      title='Thêm tháng đặc biệt'
      okText='Thêm tháng'
      cancelText='Hủy'
      confirmLoading={isAdding}
      onOk={() => void submit()}
      onCancel={onClose}
    >
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className='flex flex-col gap-4'
      >
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
              value={field.value ? dayjs(field.value, MONTH_KEY_FORMAT) : null}
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
        <p className='text-xs text-muted-foreground'>
          Chọn được từ tháng hiện tại trở đi. Tháng đã qua không thể sửa hoặc
          xóa.
        </p>
        {serverError && (
          <p
            role='alert'
            className='text-sm text-danger-strong'
          >
            {serverError}
          </p>
        )}
      </form>
    </ModalComponent>
  )
}
