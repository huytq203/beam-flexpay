import { useState } from 'react'
import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  Input,
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'
import {
  LEVEL_OPTIONS,
  STATUS_OPTIONS
} from '../constants/bankAccount.constants'

interface BankAccountFiltersProps {
  keyword: string
  merchant?: PickedEntity
  level?: BankAccountDto['level']
  status?: BankAccountDto['status']
  onKeywordChange: (value: string) => void
  onMerchantChange: (merchant?: PickedEntity) => void
  onLevelChange: (level?: BankAccountDto['level']) => void
  onStatusChange: (status?: BankAccountDto['status']) => void
  onClear: () => void
  onSearch: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'
export function BankAccountFilters(props: BankAccountFiltersProps) {
  const [isPicking, setIsPicking] = useState(false)

  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        props.onSearch()
      }}
      onReset={props.onClear}
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
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <div>
          <label
            className={labelClass}
            htmlFor='bank-query'
          >
            Từ khóa
          </label>
          <Input
            id='bank-query'
            allowClear
            value={props.keyword}
            onChange={(event) => props.onKeywordChange(event.target.value)}
            placeholder='Tên chủ tài khoản, số tài khoản…'
          />
        </div>
        <PickerTrigger
          id='bank-filter-merchant'
          label='Merchant'
          value={describePicked(props.merchant)}
          placeholder='Tất cả Merchant'
          onOpen={() => setIsPicking(true)}
          onClear={() => props.onMerchantChange(undefined)}
        />
        <div>
          <label
            className={labelClass}
            htmlFor='bank-filter-level'
          >
            Cấp áp dụng
          </label>
          <SelectComponent
            id='bank-filter-level'
            allowClear
            className='w-full'
            value={props.level}
            onChange={props.onLevelChange}
            options={LEVEL_OPTIONS}
            placeholder='Tất cả cấp'
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='bank-filter-status'
          >
            Trạng thái
          </label>
          <SelectComponent
            id='bank-filter-status'
            allowClear
            className='w-full'
            value={props.status}
            onChange={props.onStatusChange}
            options={STATUS_OPTIONS}
            placeholder='Tất cả trạng thái'
          />
        </div>
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent
          className='w-full sm:w-auto'
          type='default'
          htmlType='reset'
          content='Xóa bộ lọc'
          icon={
            <BroomIcon
              aria-hidden
              size={18}
            />
          }
        />
        <ButtonComponent
          className='w-full sm:w-auto'
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
      <MerchantPickerDialog
        open={isPicking}
        selectedId={props.merchant?.id}
        onCancel={() => setIsPicking(false)}
        onSelect={(value) => {
          props.onMerchantChange(toPickedEntity(value))
          setIsPicking(false)
        }}
      />
    </form>
  )
}
