import { useForm, type SubmitHandler } from 'react-hook-form'

import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'

import { PARENT_MERCHANT_FIXTURES } from '../constants/subMerchant.fixture'
import type { SubMerchantFiltersValue } from '../hooks/useSubMerchants'

interface SubMerchantFiltersProps {
  value: SubMerchantFiltersValue
  onSearch: (value: SubMerchantFiltersValue) => void
  onReset: () => void
}

const FIELD_CLASS = 'flex flex-col gap-1.5'
const LABEL_CLASS = 'text-sm font-medium text-foreground'
const STATUS_OPTIONS = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Đã khóa', value: 'LOCKED' },
  { label: 'Tạm ngưng theo cấp cha', value: 'SUSPENDED_BY_PARENT' }
]
const PARENT_OPTIONS = Object.values(PARENT_MERCHANT_FIXTURES).map((parent) => ({
  label: `${parent.name} (${parent.code})`,
  value: parent.id
}))

export function SubMerchantFilters({ value, onSearch, onReset }: SubMerchantFiltersProps) {
  const form = useForm<SubMerchantFiltersValue>({ defaultValues: value })
  const handleSubmit: SubmitHandler<SubMerchantFiltersValue> = onSearch

  const handleReset = (): void => {
    form.reset({ query: '' })
    onReset()
  }

  return (
    <form className='space-y-4' onReset={handleReset} onSubmit={form.handleSubmit(handleSubmit)}>
      <div className='flex items-center gap-2 border-b border-border pb-3'>
        <FunnelIcon aria-hidden className='text-secondary-foreground' size={18} />
        <h2 className='font-display text-base font-semibold text-foreground'>Bộ lọc tìm kiếm</h2>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <FormInput className={FIELD_CLASS} classNameLable={LABEL_CLASS} control={form.control} label='Từ khóa' name='query' placeholder='Mã, tên, Merchant cha hoặc số điện thoại' />
        <FormSelect className={FIELD_CLASS} classNameLable={LABEL_CLASS} control={form.control} label='Merchant cha' name='parentMerchantId' options={PARENT_OPTIONS} placeholder='Tất cả Merchant cha' />
        <FormSelect className={FIELD_CLASS} classNameLable={LABEL_CLASS} control={form.control} label='Trạng thái' name='status' options={STATUS_OPTIONS} placeholder='Tất cả trạng thái' />
        <FormDatePicker className={FIELD_CLASS} classNameLable={LABEL_CLASS} control={form.control} isRange label='Ngày tạo' name='createdRange' placeholder={['Từ ngày', 'Đến ngày']} />
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent className='w-full sm:w-auto' content='Xóa bộ lọc' htmlType='reset' icon={<BroomIcon aria-hidden size={18} />} type='default' />
        <ButtonComponent className='w-full sm:w-auto' content='Tìm kiếm' htmlType='submit' icon={<MagnifyingGlassIcon aria-hidden size={18} />} />
      </div>
    </form>
  )
}
