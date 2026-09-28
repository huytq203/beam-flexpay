import { useState } from 'react'
import type { ApiSubMerchantSummary } from '@/app/services/merchantHierarchyApi'
import {
  MultiPickerTrigger,
  SubMerchantPickerDialog,
  type PickedEntity
} from '@components/index'

/** Sub-merchant đã chọn kèm Merchant cha để lọc lại khi phạm vi Merchant đổi. */
export interface PickedSub extends PickedEntity {
  merchantId: string
}

interface UserSubMerchantFieldProps {
  id: string
  merchantIds: readonly string[]
  selected: PickedSub[]
  disabled?: boolean
  onChange: (subs: PickedSub[]) => void
}

const toPickedSub = (
  row: PickedEntity | ApiSubMerchantSummary,
  fallbackMerchantId: string
): PickedSub => ({
  id: row.id,
  code: row.code,
  name: row.name,
  merchantId: 'merchantId' in row ? row.merchantId : fallbackMerchantId
})

// Sub-merchant chỉ gán được khi User thuộc đúng một Merchant (quy tắc của BE).
export function UserSubMerchantField({
  id,
  merchantIds,
  selected,
  disabled = false,
  onChange
}: UserSubMerchantFieldProps) {
  const [isPicking, setIsPicking] = useState(false)
  const merchantId = merchantIds.length === 1 ? merchantIds[0] : undefined

  return (
    <>
      <MultiPickerTrigger
        id={id}
        label='Sub-merchant được truy cập'
        entityLabel='Sub-merchant'
        disabled={disabled || !merchantId}
        selected={selected}
        placeholder={
          merchantId
            ? 'Chưa chọn Sub-merchant'
            : 'Chỉ gán được khi User thuộc đúng một Merchant'
        }
        onOpen={() => setIsPicking(true)}
        onRemove={(subId) =>
          onChange(selected.filter((item) => item.id !== subId))
        }
      />
      {merchantId && (
        <SubMerchantPickerDialog
          mode='multiple'
          open={isPicking}
          merchantId={merchantId}
          selected={selected}
          onCancel={() => setIsPicking(false)}
          onConfirm={(rows) => {
            onChange(rows.map((row) => toPickedSub(row, merchantId)))
            setIsPicking(false)
          }}
        />
      )}
    </>
  )
}
