import { useState } from 'react'
import type { ApiCredential } from '@/app/services/merchantGatewayApi'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

interface KeyConnectionFiltersProps {
  merchant?: PickedEntity
  status?: ApiCredential['status']
  canClear: boolean
  onMerchantChange: (merchant?: PickedEntity) => void
  onStatusChange: (status?: ApiCredential['status']) => void
  onClear: () => void
  onSearch: () => void
}

const statusOptions = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Đã thu hồi', value: 'REVOKED' },
  { label: 'Hết hạn', value: 'EXPIRED' }
]

export function KeyConnectionFilters({
  merchant,
  status,
  canClear,
  onMerchantChange,
  onStatusChange,
  onClear,
  onSearch
}: KeyConnectionFiltersProps) {
  const [isPicking, setIsPicking] = useState(false)

  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
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
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <PickerTrigger
          id='filter-key-merchant'
          label='Merchant'
          value={describePicked(merchant)}
          placeholder='Tất cả Merchant'
          onOpen={() => setIsPicking(true)}
          onClear={() => onMerchantChange(undefined)}
        />
        <div className='flex min-w-0 flex-col gap-1.5'>
          <label
            className='text-sm font-medium text-foreground'
            htmlFor='filter-key-status'
          >
            Trạng thái
          </label>
          <SelectComponent
            id='filter-key-status'
            allowClear
            aria-label='Lọc trạng thái key'
            className='w-full'
            onChange={onStatusChange}
            options={statusOptions}
            placeholder='Tất cả trạng thái'
            value={status}
          />
        </div>
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Xóa bộ lọc'
          icon={
            <BroomIcon
              aria-hidden
              size={18}
            />
          }
          disabled={!canClear}
          className='w-full sm:w-auto'
          onClick={onClear}
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
          className='w-full sm:w-auto'
        />
      </div>
      <MerchantPickerDialog
        open={isPicking}
        selectedId={merchant?.id}
        onCancel={() => setIsPicking(false)}
        onSelect={(value) => {
          onMerchantChange(toPickedEntity(value))
          setIsPicking(false)
        }}
      />
    </form>
  )
}
