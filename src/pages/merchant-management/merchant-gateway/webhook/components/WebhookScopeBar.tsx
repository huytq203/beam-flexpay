import { useState } from 'react'
import {
  MerchantPickerDialog,
  PickerTrigger,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

interface WebhookScopeBarProps {
  merchant?: PickedEntity
  sub?: PickedEntity
  onMerchantChange: (merchant?: PickedEntity) => void
  onSubChange: (sub?: PickedEntity) => void
}

export function WebhookScopeBar({
  merchant,
  sub,
  onMerchantChange,
  onSubChange
}: WebhookScopeBarProps) {
  const [picking, setPicking] = useState<'merchant' | 'sub' | null>(null)

  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
      <PickerTrigger
        id='webhook-merchant'
        label='Merchant (Master)'
        value={describePicked(merchant)}
        placeholder='Chọn Merchant'
        onOpen={() => setPicking('merchant')}
        onClear={() => onMerchantChange(undefined)}
      />
      <PickerTrigger
        id='webhook-sub'
        label='Sub-merchant'
        value={describePicked(sub)}
        placeholder={
          merchant
            ? 'Cấu hình của Master (chọn để xem Sub)'
            : 'Chọn Merchant trước'
        }
        disabled={!merchant}
        onOpen={() => setPicking('sub')}
        onClear={() => onSubChange(undefined)}
      />
      <MerchantPickerDialog
        open={picking === 'merchant'}
        selectedId={merchant?.id}
        onCancel={() => setPicking(null)}
        onSelect={(value) => {
          onMerchantChange(toPickedEntity(value))
          setPicking(null)
        }}
      />
      <SubMerchantPickerDialog
        open={picking === 'sub'}
        merchantId={merchant?.id}
        selectedId={sub?.id}
        onCancel={() => setPicking(null)}
        onSelect={(value) => {
          onSubChange(toPickedEntity(value))
          setPicking(null)
        }}
      />
    </div>
  )
}
