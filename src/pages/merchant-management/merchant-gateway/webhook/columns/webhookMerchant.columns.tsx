import type { TableProps } from 'antd'
import type { GatewayMerchant } from '@/app/services/merchantGatewayApi'
import { ButtonComponent } from '@components/index'
import { WebhookRowCell } from '../components/WebhookRowCell'

type Columns = NonNullable<TableProps<GatewayMerchant>['columns']>

/** `page` tính từ 1 như API danh sách merchant. */
export const createWebhookMerchantColumns = (
  page: number,
  size: number,
  onOpen: (merchant: GatewayMerchant) => void
): Columns => [
  {
    title: '#',
    align: 'center',
    width: 56,
    render: (_value, _record, index) => (page - 1) * size + index + 1
  },
  {
    title: 'Merchant',
    width: 220,
    render: (_, record) => (
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {record.name}
        </div>
        <div className='text-xs text-muted-foreground'>{record.code}</div>
      </div>
    )
  },
  {
    title: 'URL nhận IPN',
    render: (_, record) => (
      <WebhookRowCell
        merchantId={record.id}
        field='url'
      />
    )
  },
  {
    title: 'Trạng thái',
    width: 140,
    render: (_, record) => (
      <WebhookRowCell
        merchantId={record.id}
        field='status'
      />
    )
  },
  {
    title: 'Cập nhật lần cuối',
    width: 170,
    render: (_, record) => (
      <WebhookRowCell
        merchantId={record.id}
        field='updatedAt'
      />
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 110,
    render: (_, record) => (
      <ButtonComponent
        type='default'
        size='small'
        content='Chi tiết'
        aria-label={`Chi tiết webhook ${record.name}`}
        onClick={() => onOpen(record)}
      />
    )
  }
]
