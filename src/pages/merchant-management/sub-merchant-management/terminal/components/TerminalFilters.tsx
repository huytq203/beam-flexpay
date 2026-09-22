import { useWatch, useForm, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'

import {
  EMPTY_TERMINAL_FILTERS,
  getActiveSubMerchantOptions,
  getMerchantOptions,
  type TerminalFiltersValue
} from '../utils/terminal.utils'

interface TerminalFiltersProps {
  value: TerminalFiltersValue
  onSearch: (filters: TerminalFiltersValue) => void
  onReset: () => void
}

const FIELD_CLASS = 'flex flex-col gap-1.5'
const LABEL_CLASS = 'text-sm font-medium text-foreground'

const TYPE_OPTIONS = [
  { value: 'STATIC_QR', label: 'QR tĩnh' },
  { value: 'DYNAMIC_QR', label: 'QR động' },
  { value: 'POS', label: 'POS' },
  { value: 'SOFTPOS', label: 'SoftPOS' }
]

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'LOCKED', label: 'Đã khóa' },
  { value: 'SUSPENDED_BY_SUB', label: 'Tạm ngưng theo Sub-merchant' }
]

export function TerminalFilters({
  value,
  onSearch,
  onReset
}: TerminalFiltersProps) {
  const form = useForm<TerminalFiltersValue>({ defaultValues: value })
  const parentMerchantId = useWatch({
    control: form.control,
    name: 'parentMerchantId'
  })
  const subMerchantOptions = getActiveSubMerchantOptions(parentMerchantId)
  const handleSubmit: SubmitHandler<TerminalFiltersValue> = onSearch

  const handleMerchantChange = (): void => {
    form.setValue('subMerchantId', undefined)
  }

  const handleReset = (): void => {
    form.reset(EMPTY_TERMINAL_FILTERS)
    onReset()
  }

  return (
    <form
      className='space-y-4'
      onReset={handleReset}
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className='flex items-center gap-2 border-b border-border pb-3'>
        <FunnelIcon
          aria-hidden
          className='text-secondary-foreground'
          size={18}
        />
        <h2 className='font-display text-base font-semibold text-foreground'>
          Bộ lọc tìm kiếm
        </h2>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5'>
        <FormInput
          control={form.control}
          name='query'
          label='Từ khóa'
          placeholder='Terminal ID hoặc tên'
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
        <FormSelect
          control={form.control}
          name='parentMerchantId'
          label='Merchant cha'
          placeholder='Tất cả'
          options={getMerchantOptions()}
          onChange={handleMerchantChange}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
        <FormSelect
          control={form.control}
          name='subMerchantId'
          label='Sub-merchant'
          placeholder='Tất cả'
          options={subMerchantOptions}
          disabled={!parentMerchantId}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
        <FormSelect
          control={form.control}
          name='type'
          label='Loại Terminal'
          placeholder='Tất cả'
          options={TYPE_OPTIONS}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
        <FormSelect
          control={form.control}
          name='status'
          label='Trạng thái'
          placeholder='Tất cả'
          options={STATUS_OPTIONS}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent
          className='w-full sm:w-auto'
          content='Xóa bộ lọc'
          htmlType='reset'
          icon={
            <BroomIcon
              aria-hidden
              size={18}
            />
          }
          type='default'
        />
        <ButtonComponent
          className='w-full sm:w-auto'
          content='Tìm kiếm'
          htmlType='submit'
          icon={
            <MagnifyingGlassIcon
              aria-hidden
              size={18}
            />
          }
        />
      </div>
    </form>
  )
}
