import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { REFUND_TYPE_OPTIONS } from '@constants/refund.constant'
import {
  REFUND_CHANNEL_OPTIONS,
  REFUND_SOURCE_OPTIONS,
  type RefundFilterKey
} from '../constants/refund.constants'
import {
  refundFilterSchema,
  type RefundFilterValues
} from '../schemas/refundForm.schema'
import type { RefundFilters } from '../utils/refund.utils'
import { RefundStatusChips } from './RefundStatusChips'

interface RefundFiltersProps {
  filters: RefundFilters
  onStatusChange: (status: string) => void
  onApply: (values: Partial<Record<RefundFilterKey, string>>) => void
  onClear: () => void
}

const EMPTY_VALUES: RefundFilterValues = {
  keyword: '',
  refundType: '',
  channel: '',
  createdSource: '',
  createdFrom: '',
  createdTo: ''
}

const FIELD_CLASS = 'flex flex-col gap-1'

export function RefundFilters({
  filters,
  onStatusChange,
  onApply,
  onClear
}: RefundFiltersProps) {
  const { control, handleSubmit, reset } = useForm<RefundFilterValues>({
    resolver: zodResolver(refundFilterSchema),
    defaultValues: {
      keyword: filters.keyword ?? '',
      refundType: filters.refundType ?? '',
      channel: filters.channel ?? '',
      createdSource: filters.createdSource ?? '',
      createdFrom: filters.createdFrom ?? '',
      createdTo: filters.createdTo ?? ''
    }
  })

  const handleApply = (values: RefundFilterValues): void =>
    onApply({
      status: filters.status,
      displayStatus: filters.displayStatus,
      keyword: values.keyword,
      refundType: values.refundType,
      channel: values.channel,
      createdSource: values.createdSource,
      createdFrom: values.createdFrom.slice(0, 10),
      createdTo: values.createdTo.slice(0, 10)
    })

  const handleClear = (): void => {
    reset(EMPTY_VALUES)
    onClear()
  }

  return (
    <section aria-label='Bộ lọc hoàn tiền'>
      <RefundStatusChips
        value={filters.displayStatus}
        onChange={onStatusChange}
      />
      <form
        noValidate
        className='flex flex-col gap-4'
        onSubmit={handleSubmit(handleApply)}
      >
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          <FormInput<RefundFilterValues>
            control={control}
            name='keyword'
            label='Từ khóa'
            className={`${FIELD_CLASS} sm:col-span-2 xl:col-span-1`}
            placeholder='Mã hoàn, mã GD gốc, mã lệnh chi'
            maxLength={100}
            allowClear
          />
          <FormSelect<RefundFilterValues>
            control={control}
            name='refundType'
            label='Loại hoàn'
            className={FIELD_CLASS}
            placeholder='Tất cả loại'
            options={REFUND_TYPE_OPTIONS}
          />
          <FormSelect<RefundFilterValues>
            control={control}
            name='channel'
            label='Kênh hoàn'
            className={FIELD_CLASS}
            placeholder='Tất cả kênh'
            options={REFUND_CHANNEL_OPTIONS}
          />
          <FormSelect<RefundFilterValues>
            control={control}
            name='createdSource'
            label='Nguồn tạo'
            className={FIELD_CLASS}
            placeholder='Tất cả nguồn'
            options={REFUND_SOURCE_OPTIONS}
          />
          <FormDatePicker<RefundFilterValues>
            control={control}
            name='createdFrom'
            label='Ngày tạo từ'
            className={FIELD_CLASS}
          />
          <FormDatePicker<RefundFilterValues>
            control={control}
            name='createdTo'
            label='Ngày tạo đến'
            className={FIELD_CLASS}
          />
        </div>
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <ButtonComponent
            type='default'
            htmlType='button'
            content='Xóa bộ lọc'
            icon={
              <BroomIcon
                aria-hidden
                size={18}
              />
            }
            onClick={handleClear}
          />
          <ButtonComponent
            htmlType='submit'
            content='Tìm kiếm'
            icon={
              <MagnifyingGlassIcon
                aria-hidden
                size={18}
              />
            }
          />
        </div>
      </form>
    </section>
  )
}
