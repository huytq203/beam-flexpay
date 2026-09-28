import { useState } from 'react'
import {
  Input,
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

import { AccessFilterActions } from './AccessFilterActions'

export interface RoleFilters {
  query: string
  merchantId?: string
  scope?: 'shared' | 'custom'
}

interface MerchantRoleFiltersProps {
  draft: RoleFilters
  onChange: (filters: RoleFilters) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'
const scopeOptions = [
  { label: 'Nhóm dùng chung', value: 'shared' },
  { label: 'Nhóm riêng Merchant', value: 'custom' }
]

export function MerchantRoleFilters({
  draft,
  onChange,
  onApply,
  onReset
}: MerchantRoleFiltersProps) {
  const [isPicking, setIsPicking] = useState(false)
  const [merchant, setMerchant] = useState<PickedEntity>()
  // Merchant lọc chỉ có thể chọn qua dialog nên luôn có bản ghi vừa chọn.
  const merchantValue =
    merchant && merchant.id === draft.merchantId ? merchant : undefined

  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      onReset={onReset}
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        <div>
          <label
            className={labelClass}
            htmlFor='merchant-role-search'
          >
            Tên nhóm quyền
          </label>
          <Input
            id='merchant-role-search'
            maxLength={100}
            allowClear
            placeholder='Tìm theo tên nhóm quyền'
            value={draft.query}
            onChange={(event) =>
              onChange({ ...draft, query: event.target.value })
            }
          />
        </div>
        <PickerTrigger
          id='merchant-role-filter-merchant'
          label='Merchant'
          value={describePicked(merchantValue)}
          placeholder='Tất cả Merchant'
          onOpen={() => setIsPicking(true)}
          onClear={() => onChange({ ...draft, merchantId: undefined })}
        />
        <div>
          <label
            className={labelClass}
            htmlFor='merchant-role-filter-scope'
          >
            Phạm vi nhóm
          </label>
          <SelectComponent
            id='merchant-role-filter-scope'
            allowClear
            className='w-full'
            options={scopeOptions}
            placeholder='Mọi phạm vi'
            value={draft.scope}
            onChange={(scope: RoleFilters['scope']) =>
              onChange({ ...draft, scope })
            }
          />
        </div>
      </div>
      <AccessFilterActions />
      <MerchantPickerDialog
        open={isPicking}
        selectedId={draft.merchantId}
        onCancel={() => setIsPicking(false)}
        onSelect={(value) => {
          setMerchant(toPickedEntity(value))
          onChange({ ...draft, merchantId: value.id })
          setIsPicking(false)
        }}
      />
    </form>
  )
}
