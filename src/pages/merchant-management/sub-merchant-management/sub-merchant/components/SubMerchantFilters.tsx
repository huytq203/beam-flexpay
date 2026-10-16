import { useState } from 'react'
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form'

import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  MerchantPickerDialog,
  type PickedEntity,
  PickerTrigger
} from '@components/index'

import {
  EMPTY_SUB_MERCHANT_FILTERS,
  type SubMerchantFiltersValue
} from '../constants/subMerchantFilters'

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

export function SubMerchantFilters({
  value,
  onSearch,
  onReset
}: SubMerchantFiltersProps) {
  // Quay lại màn thì ô lọc hiện lại đúng bộ lọc đang áp dụng trên URL.
  const form = useForm<SubMerchantFiltersValue>({ defaultValues: value })
  const parent = useWatch({ control: form.control, name: 'parentMerchant' })
  const [isPickingParent, setIsPickingParent] = useState(false)
  const handleSubmit: SubmitHandler<SubMerchantFiltersValue> = onSearch

  const pickParent = (value?: PickedEntity): void => {
    form.setValue('parentMerchant', value)
    setIsPickingParent(false)
  }
  const handleReset = (): void => {
    form.reset(EMPTY_SUB_MERCHANT_FILTERS)
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
          size={18}
          className='text-secondary-foreground'
        />
        <h2 className='font-display text-base font-semibold text-foreground'>
          Bộ lọc tìm kiếm
        </h2>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <FormInput
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
          control={form.control}
          label='Từ khóa'
          name='query'
          placeholder='Mã, tên, Merchant cha hoặc số điện thoại'
        />
        <PickerTrigger
          id='sub-merchant-filter-parent'
          label='Merchant cha'
          value={parent ? `${parent.code} — ${parent.name}` : undefined}
          placeholder='Tất cả Merchant cha'
          onOpen={() => setIsPickingParent(true)}
          onClear={() => pickParent(undefined)}
        />
        <FormSelect
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
          control={form.control}
          label='Trạng thái'
          name='status'
          options={STATUS_OPTIONS}
          placeholder='Tất cả trạng thái'
        />
        <FormDatePicker
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
          control={form.control}
          isRange
          label='Ngày tạo'
          name='createdRange'
          placeholder={['Từ ngày', 'Đến ngày']}
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
      <MerchantPickerDialog
        open={isPickingParent}
        selectedId={parent?.id}
        onCancel={() => setIsPickingParent(false)}
        onSelect={({ id, code, name }) => pickParent({ id, code, name })}
      />
    </form>
  )
}
