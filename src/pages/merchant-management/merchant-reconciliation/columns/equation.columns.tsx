import type { TableProps } from 'antd'
import { TagComponent } from '@components/index'
import { FREEZE_NOT_APPLIED_NOTE } from '../constants/reconciliation.constants'
import type { ReconciliationEquation } from '../types/reconciliation.types'
import {
  formatEquationValue,
  formatSignedDifference,
  isCountEquation
} from '../utils/reconciliation.utils'

type Columns = NonNullable<TableProps<ReconciliationEquation>['columns']>

const NUMBER_CELL = 'tabular-nums whitespace-nowrap text-right'

/** Chín phương trình cố định nên cột # là số phương trình do BE đánh. */
export const createEquationColumns = (): Columns => [
  {
    title: '#',
    dataIndex: 'no',
    width: 56,
    align: 'center'
  },
  {
    title: 'Phương trình',
    render: (_, row) => (
      <div className='min-w-0 max-w-[48ch]'>
        <div className='text-sm'>{row.label}</div>
        {row.code === 'ORDER_FREEZE' && (
          <div className='mt-1 text-xs text-muted-foreground'>
            {FREEZE_NOT_APPLIED_NOTE}
          </div>
        )}
      </div>
    )
  },
  {
    title: 'Theo sổ cái',
    align: 'right',
    render: (_, row) => (
      <span className={NUMBER_CELL}>
        {isCountEquation(row) ? '—' : formatEquationValue(row, row.ledger)}
      </span>
    )
  },
  {
    title: 'Theo chi tiết',
    align: 'right',
    render: (_, row) => (
      <span className={NUMBER_CELL}>
        {formatEquationValue(row, row.detail)}
      </span>
    )
  },
  {
    title: 'Chênh lệch',
    align: 'right',
    render: (_, row) => (
      <span className={NUMBER_CELL}>
        {formatSignedDifference(row, row.difference)}
      </span>
    )
  },
  {
    title: 'Kết quả',
    align: 'center',
    render: (_, row) =>
      row.code === 'ORDER_FREEZE' ? (
        <TagComponent color='default'>Chưa áp dụng</TagComponent>
      ) : (
        <TagComponent color={row.ok ? 'success' : 'error'}>
          {row.ok ? 'Cân' : 'Lệch'}
        </TagComponent>
      )
  }
]
