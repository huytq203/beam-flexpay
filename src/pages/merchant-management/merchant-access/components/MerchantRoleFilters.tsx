import { ButtonComponent, Input, SelectComponent } from '@components/index'

import type { AccessMerchant } from '../types/merchantAccess.types'

export interface RoleFilters {
  query: string
  merchantId?: string
  scope?: 'shared' | 'custom'
}

interface Props {
  draft: RoleFilters
  merchants: readonly AccessMerchant[]
  onChange: (filters: RoleFilters) => void
  onApply: () => void
  onReset: () => void
}

export function MerchantRoleFilters({
  draft,
  merchants,
  onChange,
  onApply,
  onReset
}: Props) {
  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3'>
        <div className='min-w-0 sm:col-span-2 xl:col-span-1'>
          <label
            className='sr-only'
            htmlFor='merchant-role-search'
          >
            Tìm nhóm quyền
          </label>
          <Input.Search
            id='merchant-role-search'
            maxLength={100}
            onChange={(event) =>
              onChange({ ...draft, query: event.target.value })
            }
            onSearch={onApply}
            placeholder='Tìm tên nhóm quyền...'
            value={draft.query}
          />
        </div>
        <SelectComponent
          allowClear
          aria-label='Lọc Merchant'
          className='w-full'
          onChange={(merchantId: string | undefined) =>
            onChange({ ...draft, merchantId })
          }
          optionFilterProp='label'
          options={merchants.map((merchant) => ({
            label: `${merchant.code} — ${merchant.name}`,
            value: merchant.id
          }))}
          placeholder='Tất cả Merchant'
          showSearch
          value={draft.merchantId}
        />
        <SelectComponent
          allowClear
          aria-label='Lọc phạm vi nhóm'
          className='w-full'
          onChange={(scope: RoleFilters['scope']) =>
            onChange({ ...draft, scope })
          }
          options={[
            { label: 'Nhóm dùng chung', value: 'shared' },
            { label: 'Nhóm riêng Merchant', value: 'custom' }
          ]}
          placeholder='Mọi phạm vi'
          value={draft.scope}
        />
      </div>
      <div className='flex flex-wrap justify-end gap-2'>
        <ButtonComponent
          className='min-w-24'
          content='Đặt lại'
          htmlType='button'
          onClick={onReset}
          type='default'
        />
        <ButtonComponent
          className='min-w-24'
          content='Áp dụng'
          htmlType='button'
          onClick={onApply}
        />
      </div>
    </div>
  )
}
