import { useState } from 'react'
import {
  MerchantPickerDialog,
  PickerTrigger,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

interface BankAccountScopeFieldsProps {
  merchant?: PickedEntity
  subMerchant?: PickedEntity
  onMerchantChange: (merchant?: PickedEntity) => void
  onSubMerchantChange: (subMerchant?: PickedEntity) => void
}

export function BankAccountScopeFields({
  merchant,
  subMerchant,
  onMerchantChange,
  onSubMerchantChange
}: BankAccountScopeFieldsProps) {
  const [picking, setPicking] = useState<'merchant' | 'sub'>()
  const [subMerchantParentId, setSubMerchantParentId] = useState<string>()

  return (
    <>
      <PickerTrigger
        id='bank-merchant'
        label='Chọn Master Merchant'
        required
        value={describePicked(merchant)}
        placeholder='Tìm theo tên hoặc mã Merchant'
        onOpen={() => setPicking('merchant')}
      />
      <PickerTrigger
        id='bank-sub-merchant'
        label='Chọn Sub-merchant (tùy chọn)'
        value={describePicked(subMerchant)}
        placeholder='Để trống = áp dụng cho Master'
        onOpen={() => setPicking('sub')}
        onClear={() => onSubMerchantChange(undefined)}
      />
      <MerchantPickerDialog
        open={picking === 'merchant'}
        title='Chọn Master Merchant'
        status='ACTIVE'
        selectedId={merchant?.id}
        onCancel={() => setPicking(undefined)}
        onSelect={(value) => {
          onMerchantChange(toPickedEntity(value))
          if (subMerchant && subMerchantParentId !== value.id) {
            onSubMerchantChange(undefined)
          }
          setPicking(undefined)
        }}
      />
      <SubMerchantPickerDialog
        open={picking === 'sub'}
        status='ACTIVE'
        selectedId={subMerchant?.id}
        onCancel={() => setPicking(undefined)}
        onSelect={(value) => {
          // Chọn thẳng Sub-merchant thì Master suy ra từ chính Sub đó.
          onSubMerchantChange(toPickedEntity(value))
          setSubMerchantParentId(value.merchantId)
          onMerchantChange({
            id: value.merchantId,
            code: value.merchantCode ?? value.merchantId,
            name: value.merchantName ?? ''
          })
          setPicking(undefined)
        }}
      />
    </>
  )
}
