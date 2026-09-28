import { ButtonComponent, Input, SelectComponent } from '@components/index'

import type {
  AccessMerchant,
  AccessSubMerchant,
  MerchantRole,
  MerchantUserStatus
} from '../types/merchantAccess.types'
import type { UserFilters } from '../constants/merchantUserList.constants'
import { STATUS_LABELS } from '../constants/merchantUserList.constants'

interface Props {
  draft: UserFilters
  merchants: readonly AccessMerchant[]
  subMerchants: readonly AccessSubMerchant[]
  roles: readonly MerchantRole[]
  onChange: (filters: UserFilters) => void
  onApply: () => void
  onReset: () => void
}

export function MerchantUserFilters({
  draft,
  merchants,
  subMerchants,
  roles,
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
            htmlFor='merchant-user-search'
          >
            Tìm User
          </label>
          <Input.Search
            id='merchant-user-search'
            maxLength={100}
            onChange={(event) =>
              onChange({ ...draft, query: event.target.value })
            }
            onSearch={onApply}
            placeholder='Họ tên, Email hoặc SĐT...'
            value={draft.query}
          />
        </div>
        <SelectComponent
          allowClear
          aria-label='Lọc Merchant'
          className='w-full'
          onChange={(merchantId: string | undefined) =>
            onChange({ ...draft, merchantId, subMerchantId: undefined })
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
          aria-label='Lọc Sub-merchant'
          className='w-full'
          disabled={!draft.merchantId}
          onChange={(subMerchantId: string | undefined) =>
            onChange({ ...draft, subMerchantId })
          }
          optionFilterProp='label'
          options={subMerchants
            .filter((sub) => sub.merchantId === draft.merchantId)
            .map((sub) => ({ label: sub.name, value: sub.id }))}
          placeholder='Tất cả Sub-merchant'
          showSearch
          value={draft.subMerchantId}
        />
        <SelectComponent<string[]>
          allowClear
          aria-label='Lọc nhóm quyền'
          className='w-full'
          mode='multiple'
          onChange={(roleIds: string[]) => onChange({ ...draft, roleIds })}
          options={roles.map((role) => ({
            label: role.name,
            value: role.id
          }))}
          placeholder='Tất cả nhóm quyền'
          value={draft.roleIds}
        />
        <SelectComponent
          allowClear
          aria-label='Lọc trạng thái'
          className='w-full'
          onChange={(status: MerchantUserStatus | undefined) =>
            onChange({ ...draft, status })
          }
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
            label,
            value
          }))}
          placeholder='Tất cả trạng thái'
          value={draft.status}
        />
        <SelectComponent
          allowClear
          aria-label='Lọc phạm vi'
          className='w-full'
          onChange={(scope: UserFilters['scope']) =>
            onChange({ ...draft, scope })
          }
          options={[
            { label: '1 Merchant', value: 'single' },
            { label: 'Nhiều Merchant', value: 'multiple' }
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
