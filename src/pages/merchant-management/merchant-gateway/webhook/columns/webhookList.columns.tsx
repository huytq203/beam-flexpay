import type { TableProps } from 'antd'
import type { WebhookListRow } from '@/app/services/merchantWebhookApi'
import { ButtonComponent, TagComponent } from '@components/index'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  DELIVERY_STATUS_COLOR,
  DELIVERY_STATUS_LABEL,
  WEBHOOK_LEVEL_LABEL,
  WEBHOOK_SOURCE_LABEL
} from '../constants/webhook.constants'

type Columns = NonNullable<TableProps<WebhookListRow>['columns']>

const dateTime = (value?: string | null) =>
  value ? formatUTCToLocalDateTime(value) : '—'

/** `page` tính từ 1 như API danh sách. */
export const createWebhookListColumns = (
  page: number,
  size: number,
  onOpen: (row: WebhookListRow) => void
): Columns => [
  {
    title: '#',
    align: 'center',
    width: 56,
    render: (_value, _record, index) => (page - 1) * size + index + 1
  },
  {
    title: 'Cấp',
    width: 120,
    render: (_, row) => (
      <TagComponent color={row.level === 'MASTER' ? 'blue' : 'default'}>
        {WEBHOOK_LEVEL_LABEL[row.level]}
      </TagComponent>
    )
  },
  {
    title: 'Merchant / Sub-merchant',
    width: 240,
    render: (_, row) => (
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {row.level === 'SUB' ? row.subMerchantName : row.merchantName}
        </div>
        <div className='text-xs text-muted-foreground'>
          {row.level === 'SUB'
            ? `${row.subMerchantCode} · thuộc ${row.merchantName}`
            : row.merchantCode}
        </div>
      </div>
    )
  },
  {
    title: 'Nguồn',
    width: 150,
    render: (_, row) => (
      <TagComponent color={row.source === 'OWN' ? 'success' : 'default'}>
        {WEBHOOK_SOURCE_LABEL[row.source] ?? row.source}
      </TagComponent>
    )
  },
  {
    title: 'URL nhận IPN',
    render: (_, row) =>
      row.url ? (
        <span
          className='block max-w-[320px] truncate font-mono text-xs'
          title={row.url}
        >
          {row.url}
        </span>
      ) : (
        <span className='text-muted-foreground'>Chưa cấu hình</span>
      )
  },
  {
    title: 'Trạng thái',
    width: 130,
    render: (_, row) =>
      row.source === 'NONE' ? (
        <TagComponent color='default'>Chưa cấu hình</TagComponent>
      ) : (
        <TagComponent color={row.enabled ? 'success' : 'warning'}>
          {row.enabled ? 'Đang bật' : 'Đang tắt'}
        </TagComponent>
      )
  },
  {
    title: 'Cập nhật lần cuối',
    width: 170,
    render: (_, row) => dateTime(row.updatedAt)
  },
  {
    title: 'Giao gần nhất',
    width: 180,
    render: (_, row) =>
      row.lastDeliveryStatus ? (
        <div className='flex flex-col gap-1'>
          <TagComponent color={DELIVERY_STATUS_COLOR[row.lastDeliveryStatus]}>
            {DELIVERY_STATUS_LABEL[row.lastDeliveryStatus]}
          </TagComponent>
          <span className='text-xs text-muted-foreground'>
            {dateTime(row.lastDeliveryAt)}
          </span>
        </div>
      ) : (
        <span className='text-muted-foreground'>—</span>
      )
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 110,
    render: (_, row) => (
      <ButtonComponent
        type='default'
        size='small'
        content='Chi tiết'
        aria-label={`Chi tiết webhook ${
          row.level === 'SUB' ? row.subMerchantName : row.merchantName
        }`}
        onClick={() => onOpen(row)}
      />
    )
  }
]
