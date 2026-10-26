import { useState } from 'react'
import {
  MerchantPickerDialog,
  PickerTrigger,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'

interface ScopeTargetPickerProps {
  kind: 'master' | 'sub'
  value?: PickedEntity
  onChange: (value?: PickedEntity) => void
}

/** Chọn một Master hoặc một Sub-merchant (không lọc theo phạm vi gán, BE cũng không lọc). */
export function ScopeTargetPicker({
  kind,
  value,
  onChange
}: ScopeTargetPickerProps) {
  const [open, setOpen] = useState(false)
  const isMaster = kind === 'master'
  const select = (picked: PickedEntity) => {
    onChange(toPickedEntity(picked))
    setOpen(false)
  }

  return (
    <>
      <PickerTrigger
        id={`scope-${kind}`}
        label={isMaster ? 'Merchant (Master)' : 'Sub-merchant'}
        value={describePicked(value)}
        placeholder={isMaster ? 'Chọn Merchant' : 'Chọn Sub-merchant'}
        onOpen={() => setOpen(true)}
        onClear={() => onChange(undefined)}
      />
      {isMaster ? (
        <MerchantPickerDialog
          open={open}
          selectedId={value?.id}
          onCancel={() => setOpen(false)}
          onSelect={select}
        />
      ) : (
        <SubMerchantPickerDialog
          open={open}
          selectedId={value?.id}
          onCancel={() => setOpen(false)}
          onSelect={select}
        />
      )}
    </>
  )
}
