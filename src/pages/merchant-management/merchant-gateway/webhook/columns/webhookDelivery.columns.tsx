import type { TableProps } from 'antd'
import type { WebhookDelivery } from '@/app/services/merchantWebhookApi'
import { TagComponent } from '@components/index'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  DELIVERY_ERROR_LABEL,
  DELIVERY_STATUS_COLOR,
  DELIVERY_STATUS_LABEL,
  ORDER_STATUS_LABEL
} from '../constants/webhook.constants'

type Columns = NonNullable<TableProps<WebhookDelivery>['columns']>

const dateLabel = (value?: string | null): string =>
  value ? formatUTCToLocalDateTime(value) : '—'

/** `page` tính từ 0 như API lịch sử gửi. */
export const createWebhookDeliveryColumns = (
  page: number,
  size: number
): Columns => [
  {
    title: '#',
    align: 'center',
    width: 56,
    render: (_value, _record, index) => page * size + index + 1
  },
  {
    title: 'Thời điểm tạo',
    width: 170,
    render: (_, record) => dateLabel(record.createdAt)
  },
  {
    title: 'Mã đơn',
    width: 150,
    render: (_, record) => (
      <span
        className='font-mono text-xs'
        title={record.orderId}
      >
        {record.orderId.slice(0, 8)}…
      </span>
    )
  },
  {
    title: 'Trạng thái đơn',
    width: 130,
    render: (_, record) =>
      ORDER_STATUS_LABEL[record.orderStatus] ?? record.orderStatus
  },
  {
    title: 'Trạng thái gửi',
    width: 130,
    render: (_, record) => (
      <TagComponent color={DELIVERY_STATUS_COLOR[record.status]}>
        {DELIVERY_STATUS_LABEL[record.status] ?? record.status}
      </TagComponent>
    )
  },
  {
    title: 'Số lần',
    align: 'center',
    width: 80,
    dataIndex: 'attempts'
  },
  {
    title: 'HTTP gần nhất',
    align: 'center',
    width: 120,
    render: (_, record) => record.lastHttpStatus ?? '—'
  },
  {
    title: 'Lỗi gần nhất',
    render: (_, record) =>
      record.lastError
        ? (DELIVERY_ERROR_LABEL[record.lastError] ?? record.lastError)
        : '—'
  },
  {
    title: 'Hoàn tất',
    width: 170,
    render: (_, record) => dateLabel(record.completedAt)
  }
]
