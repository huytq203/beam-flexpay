import type { TableProps } from 'antd'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { TagComponent } from '@components/index'
import {
  OUTCOME_LABEL,
  TRIGGER_LABEL
} from '../constants/reconciliation.constants'
import type { ReconciliationResult } from '../types/reconciliation.types'

type Columns = NonNullable<TableProps<ReconciliationResult>['columns']>

export interface ResultColumnOptions {
  page: number
  pageSize: number
}

const businessDate = (value: string) => value.split('-').reverse().join('/')

export const createResultColumns = ({
  page,
  pageSize
}: ResultColumnOptions): Columns => [
  {
    title: '#',
    width: 56,
    align: 'center',
    render: (_, __, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Ngày nghiệp vụ',
    dataIndex: 'businessDate',
    render: businessDate
  },
  { title: 'Lần chạy', dataIndex: 'runNo', align: 'center', width: 90 },
  {
    title: 'Nguồn',
    dataIndex: 'trigger',
    render: (value: ReconciliationResult['trigger']) =>
      TRIGGER_LABEL[value] ?? value
  },
  {
    title: 'Kết quả',
    dataIndex: 'result',
    render: (value: ReconciliationResult['result']) => {
      const outcome = OUTCOME_LABEL[value]
      return outcome ? (
        <TagComponent color={outcome.color}>{outcome.label}</TagComponent>
      ) : (
        value
      )
    }
  },
  {
    title: 'Số phương trình lệch',
    dataIndex: 'mismatchCount',
    align: 'center'
  },
  {
    title: 'Thời điểm ghi',
    dataIndex: 'createdAt',
    render: (value: string) => formatUTCToLocalDateTime(value) || '—'
  }
]
