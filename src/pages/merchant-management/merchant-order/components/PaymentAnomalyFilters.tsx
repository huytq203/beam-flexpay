import { SelectComponent } from '@components/index'
import { AccessFilterActions } from '../../merchant-access/components/AccessFilterActions'
import { ANOMALY_STATUS_LABELS } from '../constants/merchantOrder.constants'
import type {
  AnomalyFilters,
  PaymentAnomalyStatus
} from '../types/merchantOrder.types'

interface Props {
  draft: AnomalyFilters
  onChange: (filters: AnomalyFilters) => void
  onApply: () => void
  onReset: () => void
}

const statusOptions = Object.entries(ANOMALY_STATUS_LABELS).map(
  ([value, label]) => ({ label, value })
)

export function PaymentAnomalyFilters({
  draft,
  onChange,
  onApply,
  onReset
}: Props) {
  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
      onReset={onReset}
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <div>
          <label
            className='mb-1 block text-sm font-medium text-foreground'
            htmlFor='payment-anomaly-filter-status'
          >
            Trạng thái xử lý
          </label>
          <SelectComponent
            id='payment-anomaly-filter-status'
            allowClear
            className='w-full'
            options={statusOptions}
            placeholder='Tất cả trạng thái'
            value={draft.status}
            onChange={(status: PaymentAnomalyStatus | undefined) =>
              onChange({ ...draft, status })
            }
          />
        </div>
      </div>
      <AccessFilterActions />
    </form>
  )
}
