import { useState } from 'react'
import {
  PickerTrigger,
  SegmentedComponent,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

type ScopeLevel = 'MASTER' | 'SUB'

interface PaymentMethodScopeFieldProps {
  masterId: string
  masterName: string
  level: ScopeLevel
  sub?: PickedEntity
  disabled?: boolean
  onLevelChange: (level: ScopeLevel) => void
  onSubChange: (sub?: PickedEntity) => void
}

/** Chọn cấp cấu hình: Master hoặc một Sub-merchant đang hoạt động của Master. */
export function PaymentMethodScopeField({
  masterId,
  masterName,
  level,
  sub,
  disabled,
  onLevelChange,
  onSubChange
}: PaymentMethodScopeFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className='space-y-3 border-b border-border pb-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h3 className='text-sm font-semibold text-foreground'>
            Phạm vi áp dụng
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            {masterName} · {level === 'MASTER' ? 'Master' : 'Sub-merchant'}
          </p>
        </div>
        <SegmentedComponent<ScopeLevel>
          ariaLabel='Cấp cấu hình'
          value={level}
          disabled={disabled}
          options={[
            { value: 'MASTER', label: 'Master' },
            { value: 'SUB', label: 'Sub-merchant' }
          ]}
          onChange={(next) => {
            onLevelChange(next)
            if (next === 'SUB' && !sub) setPickerOpen(true)
          }}
        />
      </div>
      {level === 'SUB' && (
        <PickerTrigger
          id='payment-method-sub'
          label='Sub-merchant'
          required
          value={describePicked(sub)}
          placeholder='Chọn Sub-merchant của Master'
          disabled={disabled}
          onOpen={() => setPickerOpen(true)}
        />
      )}
      <SubMerchantPickerDialog
        open={pickerOpen}
        merchantId={masterId}
        status='ACTIVE'
        selectedId={sub?.id}
        onSelect={(row) => {
          setPickerOpen(false)
          onSubChange(toPickedEntity(row))
        }}
        onCancel={() => setPickerOpen(false)}
      />
    </div>
  )
}
