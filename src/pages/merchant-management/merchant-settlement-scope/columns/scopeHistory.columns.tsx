import type { TableProps } from 'antd'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  FREQUENCY_LABEL,
  MODE_LABEL
} from '../../merchant-settlement/constants/settlementConfig.constants'
import { FIELD_LABEL } from '../constants/settlementScope.constants'
import type { HistoryRow } from '../types/settlementScope.types'
import {
  diffSnapshot,
  type SnapshotChange
} from '../utils/settlementScope.utils'

type Columns = NonNullable<TableProps<HistoryRow>['columns']>

const NONE = 'Kế thừa'

export const formatSnapshotValue = (
  key: SnapshotChange['key'],
  value: unknown
): string => {
  if (value === undefined || value === null || value === '') return NONE
  if (key === 'settlementMode')
    return MODE_LABEL[value as keyof typeof MODE_LABEL] ?? String(value)
  if (key === 'autoFrequency')
    return (
      FREQUENCY_LABEL[value as keyof typeof FREQUENCY_LABEL] ?? String(value)
    )
  if (key === 'active') return value ? 'Có' : 'Không'
  if (key === 'holdbackDays') return `${String(value)} ngày`
  return String(value)
}

/** `previousRow` là dòng cũ hơn liền kề (BE trả mới nhất trước). */
export const describeChange = (
  row: HistoryRow,
  previousRow?: HistoryRow
): string[] => {
  if (row.corrupted) return ['Không đọc được nội dung thay đổi']
  if (row.snapshot === null) return ['Không còn cấu hình riêng (kế thừa)']
  const changes = diffSnapshot(previousRow?.snapshot ?? null, row.snapshot)
  if (changes.length === 0) return ['Không đổi giá trị']
  return changes.map(
    ({ key, before, after }) =>
      `${FIELD_LABEL[key]}: ${formatSnapshotValue(key, before)} → ${formatSnapshotValue(key, after)}`
  )
}

export const createScopeHistoryColumns = (
  rows: HistoryRow[],
  page: number,
  pageSize: number
): Columns => [
  {
    title: '#',
    width: 56,
    align: 'center',
    render: (_, __, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Thời điểm',
    dataIndex: 'changedAt',
    render: (value: string | null) => formatUTCToLocalDateTime(value) || '—'
  },
  {
    title: 'Thay đổi',
    render: (_, row) => {
      const previous = rows[rows.indexOf(row) + 1]
      return (
        <ul className='m-0 list-none p-0'>
          {describeChange(row, previous).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )
    }
  },
  {
    title: 'Lý do',
    dataIndex: 'reason',
    render: (value: string | null) => value || '—'
  },
  {
    title: 'Người thực hiện',
    dataIndex: 'changedBy',
    render: (value: string | null) => value ?? 'Hệ thống (bản ghi nền)'
  }
]
