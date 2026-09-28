import { useState } from 'react'
import { Controller, type Control } from 'react-hook-form'
import {
  MerchantPickerDialog,
  MultiPickerTrigger,
  type PickedEntity
} from '@components/index'

import type { MerchantUserForm } from '../schemas/merchantAccess.schemas'
import type { AccessMerchant } from '../types/merchantAccess.types'
import { resolvePicked } from '../utils/merchantAccess.utils'

interface UserMerchantScopeFieldProps {
  control: Control<MerchantUserForm>
  getMerchant: (id: string) => AccessMerchant | undefined
  onMerchantsChange: (merchantIds: string[]) => void
  disabled?: boolean
}

export function UserMerchantScopeField({
  control,
  getMerchant,
  onMerchantsChange,
  disabled = false
}: UserMerchantScopeFieldProps) {
  const [isPicking, setIsPicking] = useState(false)
  const [picked, setPicked] = useState<PickedEntity[]>([])

  return (
    <Controller
      control={control}
      name='merchantIds'
      render={({ field, fieldState }) => {
        const ids = Array.isArray(field.value) ? field.value : []
        const selected = ids.flatMap((id) => {
          const entity = resolvePicked(
            id,
            picked.find((item) => item.id === id),
            getMerchant
          )
          return entity ? [entity] : []
        })
        const commit = (next: PickedEntity[]) => {
          setPicked(next)
          const nextIds = next.map((item) => item.id)
          field.onChange(nextIds)
          onMerchantsChange(nextIds)
        }
        return (
          <div className='sm:col-span-2'>
            <MultiPickerTrigger
              id='merchantIds'
              label='Merchant trong phạm vi quản lý'
              entityLabel='Merchant'
              required
              disabled={disabled}
              selected={selected}
              placeholder='Chưa chọn Merchant'
              error={fieldState.error?.message}
              onOpen={() => setIsPicking(true)}
              onRemove={(id) =>
                commit(selected.filter((item) => item.id !== id))
              }
            />
            <MerchantPickerDialog
              mode='multiple'
              open={isPicking}
              title='Chọn Merchant quản lý'
              selected={selected}
              onCancel={() => setIsPicking(false)}
              onConfirm={(next) => {
                commit(next)
                setIsPicking(false)
              }}
            />
          </div>
        )
      }}
    />
  )
}
