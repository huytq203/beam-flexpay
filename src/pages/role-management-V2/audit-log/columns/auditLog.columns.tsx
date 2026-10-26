import type { TableProps } from 'antd'
import { EyeOutlined } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { AuditLogActionTag } from '../components/AuditLogActionTag'
import type { AuditLogRecord } from '../types/auditLog.types'
import {
  actorTypeLabel,
  entityLabel,
  formatOccurredAt
} from '../utils/auditLog.utils'

type Columns = NonNullable<TableProps<AuditLogRecord>['columns']>

interface AuditLogColumnOptions {
  page: number
  pageSize: number
  onView: (record: AuditLogRecord) => void
}

const dash = (value: string | null) => value || '—'

export const createAuditLogColumns = ({
  page,
  pageSize,
  onView
}: AuditLogColumnOptions): Columns => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _record, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Thời gian',
    dataIndex: 'occurredAt',
    width: 170,
    render: (value: string) => formatOccurredAt(value)
  },
  {
    title: 'Đối tượng',
    width: 240,
    render: (_value, record) => (
      <div className='flex min-w-0 flex-col'>
        <span className='text-sm text-foreground'>
          {entityLabel(record.entityName)}
        </span>
        <span className='break-all font-mono text-xs text-muted-foreground'>
          {dash(record.entityId)}
        </span>
      </div>
    )
  },
  {
    title: 'Hành động',
    dataIndex: 'action',
    width: 140,
    render: (value: string) => <AuditLogActionTag action={value} />
  },
  {
    title: 'Người thực hiện',
    width: 220,
    render: (_value, record) => (
      <div className='flex min-w-0 flex-col'>
        <span className='text-sm text-foreground'>
          {dash(record.actorUsername)}
        </span>
        <span className='text-xs text-muted-foreground'>
          {actorTypeLabel(record.actorType)}
        </span>
      </div>
    )
  },
  {
    title: 'Lý do',
    dataIndex: 'reason',
    width: 240,
    render: (value: string | null) => (
      <span className='line-clamp-2 break-words'>{dash(value)}</span>
    )
  },
  {
    title: 'Địa chỉ IP',
    dataIndex: 'ipAddress',
    width: 130,
    render: (value: string | null) => dash(value)
  },
  {
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 90,
    render: (_value, record) => (
      <TooltipComponent title='Xem chi tiết'>
        <ButtonComponent
          type='text'
          size='small'
          aria-label={`Xem nhật ký ${record.id}`}
          icon={<EyeOutlined aria-hidden />}
          onClick={() => onView(record)}
        />
      </TooltipComponent>
    )
  }
]
