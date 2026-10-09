import type { TableProps } from 'antd'
import type { WalletLimitHistoryEntry } from '@type/walletLimit.type'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { TagComponent } from '@components/index'
import { WalletLimitHistoryChanges } from '../components/WalletLimitHistoryChanges'
import { getRowNumber } from '../utils/walletLimit.format'

type Columns = NonNullable<TableProps<WalletLimitHistoryEntry>['columns']>

interface WalletLimitHistoryColumnOptions {
  page: number
  size: number
}

const ACTION_PRESENTATION = {
  INSERT: { label: 'Tạo mới', color: 'cyan' },
  UPDATE: { label: 'Cập nhật', color: 'default' }
} as const

export const createWalletLimitHistoryColumns = ({
  page,
  size
}: WalletLimitHistoryColumnOptions): Columns => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => getRowNumber(page, size, index)
  },
  {
    title: 'Thời gian',
    width: 240,
    render: (_, row) => (
      <div className='min-w-0'>
        <strong>{formatUTCToLocalDateTime(row.occurredAt)}</strong>
        <div className='text-xs text-muted-foreground'>
          {[row.actorUsername, row.ipAddress && `IP ${row.ipAddress}`]
            .filter(Boolean)
            .join(' · ') || '—'}
        </div>
      </div>
    )
  },
  {
    title: 'Hành động',
    width: 130,
    render: (_, row) => (
      <TagComponent color={ACTION_PRESENTATION[row.action].color}>
        {ACTION_PRESENTATION[row.action].label}
      </TagComponent>
    )
  },
  {
    title: 'Thay đổi',
    render: (_, row) => <WalletLimitHistoryChanges changes={row.changes} />
  }
]
