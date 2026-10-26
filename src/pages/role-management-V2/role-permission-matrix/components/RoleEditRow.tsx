import { CheckboxComponent, SelectComponent } from '@components/index'
import {
  ACCESS_TYPES,
  ACCESS_TYPE_LABEL,
  ACCESS_TYPE_SYMBOL
} from '../constants/rolePermissionMatrix.constants'
import type {
  AdminAccessScope,
  AdminAccessType,
  AdminFunctionRow,
  DraftCell
} from '../types/rolePermissionMatrix.types'

interface Props {
  row: AdminFunctionRow
  cell: DraftCell
  changed: boolean
  onAccessType: (accessType: AdminAccessType | null) => void
  onScope: (scope: AdminAccessScope) => void
}

const NONE = '__NONE__'
const OPTIONS = [
  { value: NONE, label: 'Không' },
  ...ACCESS_TYPES.map((type) => ({
    value: type,
    label: `${ACCESS_TYPE_SYMBOL[type]} - ${ACCESS_TYPE_LABEL[type]}`
  }))
]

export function RoleEditRow({
  row,
  cell,
  changed,
  onAccessType,
  onScope
}: Props) {
  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 ${changed ? 'bg-warning/10' : ''}`}
      data-changed={changed || undefined}
    >
      <div className='min-w-0 flex-1'>
        <div className='text-sm'>{row.displayName}</div>
        <div className='text-xs text-muted-foreground'>{row.code}</div>
      </div>
      <div className='flex items-center gap-3'>
        <CheckboxComponent
          aria-label={`Chỉ merchant được gán: ${row.displayName}`}
          checked={cell.scope === 'ASSIGNED'}
          disabled={cell.accessType === null}
          onChange={(event) =>
            onScope(event.target.checked ? 'ASSIGNED' : 'ALL')
          }
        >
          Assigned
        </CheckboxComponent>
        <SelectComponent<string>
          aria-label={`Quyền: ${row.displayName}`}
          className='w-40'
          onChange={(value) =>
            onAccessType(value === NONE ? null : (value as AdminAccessType))
          }
          options={OPTIONS}
          value={cell.accessType ?? NONE}
        />
      </div>
    </li>
  )
}
