import { useState } from 'react'
import {
  useGetHierarchyParentByIdQuery,
  useGetSubMerchantDetailQuery
} from '@/app/services/merchantHierarchyApi'
import {
  MerchantPickerDialog,
  PickerTrigger,
  SelectInput,
  SubMerchantPickerDialog
} from '@components/index'
import { LEVEL_OPTIONS } from '../constants/withdrawalLimit.constants'
import type { LimitLevel } from '../types/withdrawalLimit.types'

interface LimitTargetPickerProps {
  level?: LimitLevel
  targetId?: string
  onChange: (level?: LimitLevel, targetId?: string) => void
}

export function LimitTargetPicker({
  level,
  targetId,
  onChange
}: LimitTargetPickerProps) {
  const [picking, setPicking] = useState(false)
  const master = useGetHierarchyParentByIdQuery(targetId ?? '', {
    skip: level !== 'MASTER' || !targetId
  })
  const sub = useGetSubMerchantDetailQuery(targetId ?? '', {
    skip: level !== 'SUB' || !targetId
  })
  const picked = level === 'MASTER' ? master.data : sub.data
  const select = (id: string) => {
    onChange(level, id)
    setPicking(false)
  }

  return (
    <div className='grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2'>
      <div>
        <label
          className='mb-1 block text-sm font-medium'
          htmlFor='limit-level'
        >
          Cấp áp dụng
        </label>
        <SelectInput
          data={LEVEL_OPTIONS}
          handleChange={(value) => onChange(value as LimitLevel)}
          id='limit-level'
          placeholder='Chọn cấp áp dụng'
          value={level}
        />
      </div>
      {(level === 'MASTER' || level === 'SUB') && (
        <PickerTrigger
          id='limit-target'
          label={level === 'MASTER' ? 'Master merchant' : 'Sub-merchant'}
          onClear={() => onChange(level)}
          onOpen={() => setPicking(true)}
          placeholder='Chọn đối tượng'
          value={picked ? `${picked.code} — ${picked.name}` : undefined}
        />
      )}
      {level === 'MASTER' && (
        <MerchantPickerDialog
          onCancel={() => setPicking(false)}
          onSelect={({ id }) => select(id)}
          open={picking}
          selectedId={targetId}
        />
      )}
      {level === 'SUB' && (
        <SubMerchantPickerDialog
          onCancel={() => setPicking(false)}
          onSelect={({ id }) => select(id)}
          open={picking}
          selectedId={targetId}
        />
      )}
    </div>
  )
}
