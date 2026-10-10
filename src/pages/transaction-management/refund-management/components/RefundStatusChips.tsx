import { ChipTab, ChipTabGroup } from '@components/index'
import { REFUND_STATUS_OPTIONS } from '../constants/refund.constants'

interface RefundStatusChipsProps {
  value?: string
  onChange: (status: string) => void
}

const ALL_OPTION = { value: '', label: 'Tất cả' }
const OPTIONS = [ALL_OPTION, ...REFUND_STATUS_OPTIONS]

export function RefundStatusChips({ value, onChange }: RefundStatusChipsProps) {
  const current = value ?? ''
  return (
    <ChipTabGroup
      aria-label='Trạng thái'
      className='mb-3'
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === current
        return (
          <ChipTab
            key={option.value}
            isActive={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </ChipTab>
        )
      })}
    </ChipTabGroup>
  )
}
