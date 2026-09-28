import { useState } from 'react'
import { MultiPickerTrigger } from '@components/index'

import type { AccessMerchant } from '../types/merchantAccess.types'
import {
  MerchantGroupPickerDialog,
  type PickedGroup
} from './MerchantGroupPickerDialog'
import { UserSubMerchantField, type PickedSub } from './UserSubMerchantField'

interface UserInitialAccessFieldsProps {
  merchantIds: readonly string[]
  groups: PickedGroup[]
  subMerchants: PickedSub[]
  getMerchant: (id: string) => AccessMerchant | undefined
  onGroupsChange: (groups: PickedGroup[]) => void
  onSubMerchantsChange: (subs: PickedSub[]) => void
}

export function UserInitialAccessFields({
  merchantIds,
  groups,
  subMerchants,
  getMerchant,
  onGroupsChange,
  onSubMerchantsChange
}: UserInitialAccessFieldsProps) {
  const [isPickingGroups, setIsPickingGroups] = useState(false)
  const singleMerchantId = merchantIds.length === 1 ? merchantIds[0] : undefined

  return (
    <div className='space-y-4 sm:col-span-2'>
      <div className='border-t border-border pt-4'>
        <h3 className='mb-3 text-sm font-semibold text-foreground'>
          Phân quyền ban đầu
        </h3>
        <div className='grid gap-4'>
          <MultiPickerTrigger
            id='new-user-groups'
            label='Nhóm quyền'
            entityLabel='nhóm quyền'
            selected={groups}
            placeholder='Chưa chọn nhóm quyền'
            onOpen={() => setIsPickingGroups(true)}
            onRemove={(id) =>
              onGroupsChange(groups.filter((item) => item.id !== id))
            }
          />
          <UserSubMerchantField
            id='new-user-subs'
            merchantIds={merchantIds}
            selected={subMerchants}
            onChange={onSubMerchantsChange}
          />
        </div>
        {merchantIds.length > 1 && (
          <p className='mt-2 text-xs text-muted-foreground'>
            User quản lý nhiều Merchant chỉ dùng nhóm quyền dùng chung.
          </p>
        )}
      </div>
      <MerchantGroupPickerDialog
        open={isPickingGroups}
        merchantId={singleMerchantId}
        selected={groups}
        getMerchant={getMerchant}
        onCancel={() => setIsPickingGroups(false)}
        onConfirm={(next) => {
          onGroupsChange(next)
          setIsPickingGroups(false)
        }}
      />
    </div>
  )
}
