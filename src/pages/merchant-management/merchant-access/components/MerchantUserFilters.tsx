import { useState } from 'react'
import {
  Input,
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

import type {
  AccessMerchant,
  AccessSubMerchant,
  MerchantRole,
  MerchantUserStatus
} from '../types/merchantAccess.types'
import type { UserFilters } from '../constants/merchantUserList.constants'
import { STATUS_LABELS } from '../constants/merchantUserList.constants'
import { resolvePicked } from '../utils/merchantAccess.utils'
import { AccessFilterActions } from './AccessFilterActions'

interface MerchantUserFiltersProps {
  draft: UserFilters
  roles: readonly MerchantRole[]
  getMerchant: (id: string) => AccessMerchant | undefined
  getSubMerchant: (id: string) => AccessSubMerchant | undefined
  onChange: (filters: UserFilters) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'
const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  label,
  value
}))
const scopeOptions = [
  { label: '1 Merchant', value: 'single' },
  { label: 'Nhiều Merchant', value: 'multiple' }
]

export function MerchantUserFilters({
  draft,
  roles,
  getMerchant,
  getSubMerchant,
  onChange,
  onApply,
  onReset
}: MerchantUserFiltersProps) {
  const [picking, setPicking] = useState<'merchant' | 'sub'>()
  const [merchant, setMerchant] = useState<PickedEntity>()
  const [sub, setSub] = useState<PickedEntity>()
  const merchantValue = resolvePicked(draft.merchantId, merchant, getMerchant)
  const subValue = resolvePicked(draft.subMerchantId, sub, getSubMerchant)

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
            htmlFor='merchant-user-search'
          >
            Từ khóa
          </label>
          <Input
            id='merchant-user-search'
            maxLength={100}
            allowClear
            placeholder='Họ tên, Email hoặc SĐT'
            value={draft.query}
            onChange={(event) =>
              onChange({ ...draft, query: event.target.value })
            }
          />
        </div>
        <PickerTrigger
          id='merchant-user-filter-merchant'
          label='Merchant'
          value={describePicked(merchantValue)}
          placeholder='Tất cả Merchant'
          onOpen={() => setPicking('merchant')}
          onClear={() => onChange({ ...draft, merchantId: undefined })}
        />
        <PickerTrigger
          id='merchant-user-filter-sub'
          label='Sub-merchant'
          value={subValue?.name}
          placeholder='Tất cả Sub-merchant'
          onOpen={() => setPicking('sub')}
          onClear={() => onChange({ ...draft, subMerchantId: undefined })}
        />
        <div>
          <label
            className={labelClass}
            htmlFor='merchant-user-filter-roles'
          >
            Nhóm quyền
          </label>
          <SelectComponent<string[]>
            id='merchant-user-filter-roles'
            allowClear
            className='w-full'
            mode='multiple'
            optionFilterProp='label'
            options={roles.map((role) => ({
              label: role.name,
              value: role.id
            }))}
            placeholder='Tất cả nhóm quyền'
            value={draft.roleIds}
            onChange={(roleIds: string[]) => onChange({ ...draft, roleIds })}
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='merchant-user-filter-status'
          >
            Trạng thái
          </label>
          <SelectComponent
            id='merchant-user-filter-status'
            allowClear
            className='w-full'
            options={statusOptions}
            placeholder='Tất cả trạng thái'
            value={draft.status}
            onChange={(status: MerchantUserStatus | undefined) =>
              onChange({ ...draft, status })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='merchant-user-filter-scope'
          >
            Phạm vi
          </label>
          <SelectComponent
            id='merchant-user-filter-scope'
            allowClear
            className='w-full'
            options={scopeOptions}
            placeholder='Mọi phạm vi'
            value={draft.scope}
            onChange={(scope: UserFilters['scope']) =>
              onChange({ ...draft, scope })
            }
          />
        </div>
      </div>
      <AccessFilterActions />
      <MerchantPickerDialog
        open={picking === 'merchant'}
        selectedId={draft.merchantId}
        onCancel={() => setPicking(undefined)}
        onSelect={(value) => {
          setMerchant(toPickedEntity(value))
          onChange({ ...draft, merchantId: value.id })
          setPicking(undefined)
        }}
      />
      <SubMerchantPickerDialog
        open={picking === 'sub'}
        selectedId={draft.subMerchantId}
        onCancel={() => setPicking(undefined)}
        onSelect={(value) => {
          setSub(toPickedEntity(value))
          onChange({ ...draft, subMerchantId: value.id })
          setPicking(undefined)
        }}
      />
    </form>
  )
}
