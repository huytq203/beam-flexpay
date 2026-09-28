import { useState } from 'react'
import {
  MerchantPickerDialog,
  PickerTrigger,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity
} from '@components/index'
import type { NotificationScopeDraft } from '../hooks/useNotificationEditor'

interface NotificationScopeFieldsProps {
  scope: NotificationScopeDraft
  locked: boolean
  onChange: (scope: NotificationScopeDraft) => void
}

// Bỏ trống Sub là cấu hình cho Master; chọn Sub thì Master suy ra từ chính Sub.
export function NotificationScopeFields({
  scope,
  locked,
  onChange
}: NotificationScopeFieldsProps) {
  const [picking, setPicking] = useState<'master' | 'sub'>()

  if (locked)
    return (
      <p className='rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground sm:col-span-2'>
        Phạm vi: <strong>{describePicked(scope.sub ?? scope.master)}</strong> ·{' '}
        {scope.sub ? 'Sub-merchant' : 'Master'}
      </p>
    )

  return (
    <>
      <PickerTrigger
        id='notification-master'
        label='Master Merchant'
        required
        value={describePicked(scope.master)}
        placeholder='Chọn Master Merchant'
        onOpen={() => setPicking('master')}
      />
      <PickerTrigger
        id='notification-sub'
        label='Sub-merchant (tùy chọn)'
        value={describePicked(scope.sub)}
        placeholder='Để trống = cấu hình cho Master'
        onOpen={() => setPicking('sub')}
        onClear={() => onChange({ ...scope, sub: undefined })}
      />
      <MerchantPickerDialog
        open={picking === 'master'}
        title='Chọn Master Merchant'
        status='ACTIVE'
        selectedId={scope.master?.id}
        onCancel={() => setPicking(undefined)}
        onSelect={(value) => {
          const keepSub = scope.sub && scope.master?.id === value.id
          onChange({
            master: toPickedEntity(value),
            sub: keepSub ? scope.sub : undefined
          })
          setPicking(undefined)
        }}
      />
      <SubMerchantPickerDialog
        open={picking === 'sub'}
        status='ACTIVE'
        selectedId={scope.sub?.id}
        onCancel={() => setPicking(undefined)}
        onSelect={(value) => {
          onChange({
            master: {
              id: value.merchantId,
              code: value.merchantCode ?? value.merchantId,
              name: value.merchantName ?? ''
            },
            sub: toPickedEntity(value)
          })
          setPicking(undefined)
        }}
      />
    </>
  )
}
