import { Input, SelectComponent } from '@components/index'
import { AccessFilterActions } from '../../merchant-access/components/AccessFilterActions'
import {
  ESCROW_RISK_LABEL,
  ESCROW_STATE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowRisk, EscrowState } from '../types/merchantEscrow.types'

export interface EscrowListFilters {
  search?: string
  state?: EscrowState | 'OVERDUE'
  risk?: EscrowRisk
  dueIn?: string
}

interface Props {
  draft: EscrowListFilters
  onChange: (filters: EscrowListFilters) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'

// UNKNOWN chỉ có ở màn chi tiết (Wallet Core không trả số dư), danh sách không lọc theo nó.
const STATE_OPTIONS = [
  ...(['NOT_CONFIGURED', 'SHORT', 'MET', 'SURPLUS'] as const).map((value) => ({
    value,
    label: ESCROW_STATE_LABEL[value]
  })),
  { value: 'OVERDUE' as const, label: 'Đã quá hạn' }
]

const RISK_OPTIONS = (['HIGH', 'MEDIUM', 'LOW'] as const).map((value) => ({
  value,
  label: ESCROW_RISK_LABEL[value]
}))

// `OVERDUE` = đã quá hạn; số = hạn rơi vào trong N ngày tới.
const DUE_OPTIONS = [
  { value: 'OVERDUE', label: 'Đã quá hạn' },
  { value: '7', label: '7 ngày' },
  { value: '30', label: '30 ngày' }
]

export function EscrowFilters({ draft, onChange, onApply, onReset }: Props) {
  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      onReset={onReset}
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
        <div>
          <label
            className={labelClass}
            htmlFor='escrow-filter-search'
          >
            Tìm kiếm
          </label>
          <Input
            id='escrow-filter-search'
            allowClear
            maxLength={100}
            placeholder='Mã hoặc tên Master'
            value={draft.search}
            onChange={(event) =>
              onChange({ ...draft, search: event.target.value })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='escrow-filter-state'
          >
            Trạng thái ký quỹ
          </label>
          <SelectComponent
            id='escrow-filter-state'
            allowClear
            className='w-full'
            options={STATE_OPTIONS}
            placeholder='Tất cả trạng thái'
            value={draft.state}
            onChange={(state) => onChange({ ...draft, state })}
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='escrow-filter-risk'
          >
            Rủi ro
          </label>
          <SelectComponent
            id='escrow-filter-risk'
            allowClear
            className='w-full'
            options={RISK_OPTIONS}
            placeholder='Tất cả mức rủi ro'
            value={draft.risk}
            onChange={(risk) => onChange({ ...draft, risk })}
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='escrow-filter-due'
          >
            Hạn ký quỹ
          </label>
          <SelectComponent
            id='escrow-filter-due'
            allowClear
            className='w-full'
            options={DUE_OPTIONS}
            placeholder='Tất cả'
            value={draft.dueIn}
            onChange={(dueIn) => onChange({ ...draft, dueIn })}
          />
        </div>
      </div>
      <AccessFilterActions />
    </form>
  )
}
