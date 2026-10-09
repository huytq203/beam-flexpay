import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { PencilLineIcon, TrashIcon } from '@components/icons'
import { TagComponent } from '@components/index'
import { SpecialMonthIconAction as IconAction } from '../components/SpecialMonthIconAction'
import {
  formatMonthLabel,
  isCurrentMonth,
  isPastMonth
} from '../utils/specialMonth.utils'

type Columns = NonNullable<TableProps<WalletLimitSpecialMonth>['columns']>

interface SpecialMonthColumnOptions {
  onRename: (month: WalletLimitSpecialMonth) => void
  onDelete: (month: WalletLimitSpecialMonth) => void
}

const PAST_MONTH_NOTE = 'Tháng đã qua, không thể sửa hoặc xóa'

export const createSpecialMonthColumns = ({
  onRename,
  onDelete
}: SpecialMonthColumnOptions): Columns => [
  {
    title: 'Tháng',
    width: 160,
    render: (_, row) => (
      <div className='flex flex-wrap items-center gap-2'>
        <strong className='tabular-nums'>
          {formatMonthLabel(row.monthStart)}
        </strong>
        {isCurrentMonth(row.monthStart) && (
          <TagComponent color='success'>Tháng hiện tại</TagComponent>
        )}
      </div>
    )
  },
  {
    title: 'Tên',
    dataIndex: 'name',
    render: (name: string) => <span className='break-words'>{name}</span>
  },
  {
    title: 'Tạo bởi',
    width: 220,
    render: (_, row) => (
      <div className='min-w-0'>
        <div>{row.createdByUsername ?? '—'}</div>
        <div className='text-xs text-muted-foreground'>
          {formatUTCToLocalDateTime(row.createdAt) || '—'}
        </div>
      </div>
    )
  },
  {
    title: 'Thao tác',
    width: 200,
    render: (_, row) => {
      if (isPastMonth(row.monthStart)) {
        return (
          <span className='text-xs text-muted-foreground'>
            {PAST_MONTH_NOTE}
          </span>
        )
      }
      const label = formatMonthLabel(row.monthStart)
      return (
        <div className='flex gap-1'>
          <Can
            screen='WALLET_LIMIT_SPECIAL_MONTH'
            action='edit'
          >
            <IconAction
              label={`Đổi tên tháng ${label}`}
              icon={
                <PencilLineIcon
                  aria-hidden
                  size={18}
                />
              }
              onClick={() => onRename(row)}
            />
          </Can>
          <Can
            screen='WALLET_LIMIT_SPECIAL_MONTH'
            action='delete'
          >
            <IconAction
              label={`Xóa tháng ${label}`}
              icon={
                <TrashIcon
                  aria-hidden
                  size={18}
                />
              }
              onClick={() => onDelete(row)}
            />
          </Can>
        </div>
      )
    }
  }
]
