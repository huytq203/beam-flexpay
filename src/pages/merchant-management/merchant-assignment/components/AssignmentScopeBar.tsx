import { useState } from 'react'
import {
  MerchantPickerDialog,
  PickerTrigger,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

interface Props {
  merchant?: PickedEntity
  sub?: PickedEntity
  onMerchantChange: (merchant?: PickedEntity) => void
  onSubChange: (sub?: PickedEntity) => void
}

export function AssignmentScopeBar({
  merchant,
  sub,
  onMerchantChange,
  onSubChange
}: Props) {
  const [picking, setPicking] = useState<'merchant' | 'sub' | null>(null)

  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
      <PickerTrigger
        id='assignment-merchant'
        label='Merchant (Master)'
        value={describePicked(merchant)}
        placeholder='Chọn Merchant'
        onOpen={() => setPicking('merchant')}
        onClear={() => onMerchantChange(undefined)}
      />
      <PickerTrigger
        id='assignment-sub'
        label='Sub-merchant (outlet)'
        value={describePicked(sub)}
        placeholder={
          merchant ? 'Để trống để gán ở cấp Master' : 'Chọn Merchant trước'
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
