import type { ColumnsType } from 'antd/es/table'
import { Can } from '@/app/permissions'
import type { NotificationListItem } from '@/app/services/merchantNotificationApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  ArrowCounterClockwiseIcon,
  EditOutlined,
  PlusOutlined
} from '@components/icons'
import { TagComponent } from '@components/index'
import { NotificationRowAction as RowAction } from '../components/NotificationRowAction'
import {
  CHANNEL_LABEL,
  SOURCE_PRESENTATION
} from '../constants/notification.constants'

interface NotificationColumnOptions {
  page: number
  size: number
  onEdit: (row: NotificationListItem) => void
  onSetup: (row: NotificationListItem) => void
  onInherit: (row: NotificationListItem) => void
}

const scopeName = (row: NotificationListItem) =>
  row.appliedLevel === 'SUB' ? 'Sub-merchant' : 'Master'

export const createNotificationColumns = ({
  page,
  size,
  onEdit,
  onSetup,
  onInherit
}: NotificationColumnOptions): ColumnsType<NotificationListItem> => [
  {
    title: '#',
    align: 'center',
    width: 60,
    render: (_value, _row, index) => (page - 1) * size + index + 1
  },
  {
    title: 'Phạm vi',
    width: 240,
    render: (_, row) => (
      <div className='min-w-0'>
        <div className='truncate font-medium text-foreground'>
          {row.merchantName}
        </div>
        <div className='text-xs text-muted-foreground'>
          {row.merchantCode} · {scopeName(row)}
        </div>
      </div>
    )
  },
  {
    title: 'Nguồn',
    width: 150,
    render: (_, row) => (
      <TagComponent color={SOURCE_PRESENTATION[row.source].color}>
        {SOURCE_PRESENTATION[row.source].label}
      </TagComponent>
    )
  },
  {
    title: 'Thông báo giao dịch',
    width: 200,
    render: (_, row) =>
      row.transactionNotificationEnabled ? (
        <div className='flex flex-wrap gap-1'>
          {row.channels.map((channel) => (
            <TagComponent key={channel}>{CHANNEL_LABEL[channel]}</TagComponent>
          ))}
        </div>
      ) : (
        <span className='text-muted-foreground'>Tắt</span>
      )
  },
  {
    title: 'Email thông báo',
    render: (_, row) => (
      <span className='line-clamp-2 text-sm text-foreground'>
        {row.notificationEmails.join(', ') || '—'}
      </span>
    )
  },
  {
    title: 'Trạng thái',
    width: 120,
    render: (_, row) => (
      <TagComponent color={row.active ? 'success' : 'default'}>
        {row.active ? 'Đang dùng' : 'Ngừng'}
      </TagComponent>
    )
  },
  {
    title: 'Cập nhật',
    width: 170,
    render: (_, row) => (
      <div className='text-xs text-muted-foreground'>
        <div>{formatUTCToLocalDateTime(row.updatedAt ?? undefined) || '—'}</div>
        {row.updatedBy && <div>{row.updatedBy}</div>}
      </div>
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 120,
    render: (_, row) => (
      <Can
        screen='MERCHANT_NOTIFICATION'
        action='edit'
      >
        <div className='flex justify-center gap-1'>
          {row.configId ? (
            <RowAction
              label={`Sửa cấu hình ${row.merchantName}`}
              icon={<EditOutlined aria-hidden />}
              onClick={() => onEdit(row)}
            />
          ) : (
            <RowAction
              label={`Thiết lập cấu hình riêng ${row.merchantName}`}
              icon={<PlusOutlined aria-hidden />}
              onClick={() => onSetup(row)}
            />
          )}
          {row.configId && row.appliedLevel === 'SUB' && (
            <RowAction
              label={`Kế thừa Master cho ${row.merchantName}`}
              icon={
                <ArrowCounterClockwiseIcon
                  aria-hidden
                  size={14}
                />
              }
              onClick={() => onInherit(row)}
            />
          )}
        </div>
      </Can>
    )
  }
]
