import { useState } from 'react'
import { Controller, type Control } from 'react-hook-form'
import {
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

import type { MerchantRoleForm } from '../schemas/merchantAccess.schemas'
import { useMerchantById } from '../hooks/useMerchantById'

const SHARED = 'shared'

interface RoleScopeFieldProps {
  control: Control<MerchantRoleForm>
  locked: boolean
  canManageSystemGroups: boolean
}

// `merchantId` của form là 'shared' (nhóm dùng chung) hoặc id Merchant sở hữu nhóm.
export function RoleScopeField({
  control,
  locked,
  canManageSystemGroups
}: RoleScopeFieldProps) {
  const [isPicking, setIsPicking] = useState(false)
  const [picked, setPicked] = useState<PickedEntity>()

  return (
    <Controller
      control={control}
      name='merchantId'
      render={({ field, fieldState }) => {
        const isShared = field.value === SHARED
        return (
          <div className='flex flex-col gap-3'>
            {canManageSystemGroups && (
              <div className='flex flex-col gap-1'>
                <label
                  className='text-sm font-medium text-foreground'
                  htmlFor='role-scope-type'
                >
                  Loại nhóm
                </label>
                <SelectComponent
                  id='role-scope-type'
                  className='w-full'
                  disabled={locked}
                  value={isShared ? SHARED : 'merchant'}
                  options={[
                    { label: 'Dùng chung toàn hệ thống', value: SHARED },
                    { label: 'Riêng một Merchant', value: 'merchant' }
                  ]}
                  onChange={(value: string) =>
                    field.onChange(value === SHARED ? SHARED : '')
                  }
                />
              </div>
            )}
            {!isShared && (
              <MerchantScopeTrigger
                merchantId={field.value}
                picked={picked}
                locked={locked}
                error={fieldState.error?.message}
                onOpen={() => setIsPicking(true)}
              />
            )}
            <MerchantPickerDialog
              open={isPicking}
              title='Chọn Merchant sở hữu nhóm'
              status='ACTIVE'
              selectedId={isShared ? undefined : field.value}
              onCancel={() => setIsPicking(false)}
              onSelect={(value) => {
                setPicked(toPickedEntity(value))
                field.onChange(value.id)
                setIsPicking(false)
              }}
            />
          </div>
        )
      }}
    />
  )
}

interface MerchantScopeTriggerProps {
  merchantId: string
  picked?: PickedEntity
  locked: boolean
  error?: string
  onOpen: () => void
}

function MerchantScopeTrigger({
  merchantId,
  picked,
  locked,
  error,
  onOpen
}: MerchantScopeTriggerProps) {
  // Nhóm đang sửa chưa có bản ghi vừa chọn nên tra theo id để hiện tên.
  const { merchant } = useMerchantById(
    picked?.id === merchantId ? undefined : merchantId
  )
  const value = picked?.id === merchantId ? picked : merchant

  return (
    <PickerTrigger
      id='merchantId'
      label='Merchant sở hữu nhóm'
      required
      disabled={locked}
      value={describePicked(value)}
      placeholder='Chọn Merchant'
      error={error}
      onOpen={onOpen}
    />
  )
}
