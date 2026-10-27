import { Input, SelectComponent } from '@components/index'
import type { AssignmentListLevel } from '@/app/services/merchantAssignmentApi'
import { AccessFilterActions } from '../../merchant-access/components/AccessFilterActions'
import {
  ASSIGNMENT_LEVEL_LABELS,
  ASSIGNMENT_SEARCH_MAX
} from '../constants/merchantAssignment.constants'
import type { OverviewFilters } from '../hooks/useAssignmentOverview'

interface Props {
  draft: OverviewFilters
  onChange: (filters: OverviewFilters) => void
  onApply: () => void
  onReset: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'
const levelOptions = [
  { label: ASSIGNMENT_LEVEL_LABELS.master, value: 'MASTER' },
  { label: ASSIGNMENT_LEVEL_LABELS.sub, value: 'SUB' }
]

export function AssignmentOverviewFilters({
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
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div>
          <label
            className={labelClass}
            htmlFor='assignment-overview-search'
          >
            Từ khóa
          </label>
          <Input
            id='assignment-overview-search'
            allowClear
            maxLength={ASSIGNMENT_SEARCH_MAX}
            placeholder='Merchant, Sub-merchant hoặc người phụ trách'
            value={draft.search}
            onChange={(event) =>
              onChange({ ...draft, search: event.target.value })
            }
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='assignment-overview-level'
          >
            Cấp phụ trách
          </label>
          <SelectComponent
            id='assignment-overview-level'
            allowClear
            className='w-full'
            options={levelOptions}
            placeholder='Tất cả cấp'
            value={draft.level}
            onChange={(level: AssignmentListLevel | undefined) =>
              onChange({ ...draft, level })
            }
          />
        </div>
      </div>
      <AccessFilterActions />
    </form>
  )
}
