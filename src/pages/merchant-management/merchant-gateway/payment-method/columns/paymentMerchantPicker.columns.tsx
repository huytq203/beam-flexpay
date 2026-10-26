import type { ColumnsType } from 'antd/es/table'
import type { GatewayMerchant } from '@/app/services/merchantGatewayApi'
import { ButtonComponent, TagComponent } from '@components/index'

const merchantStatus: Record<
  string,
  { label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'warning' },
  ACTIVE: { label: 'Hoạt động', color: 'success' },
  REJECTED: { label: 'Từ chối', color: 'error' },
  LOCKED: { label: 'Bị khóa', color: 'error' },
  TERMINATED: { label: 'Đã kết thúc', color: 'default' }
}

interface MerchantPickerColumnOptions {
  page: number
  size: number
  selectedId?: string
  onSelect: (merchant: GatewayMerchant) => void
}

export const createPaymentMerchantPickerColumns = ({
  page,
  size,
  selectedId,
  onSelect
}: MerchantPickerColumnOptions): ColumnsType<GatewayMerchant> => [
  {
    title: '#',
    align: 'center',
    width: 60,
    render: (_value, _row, index) => (page - 1) * size + index + 1
  },
  {
    title: 'Merchant',
    render: (_, merchant) => (
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {merchant.name}
        </div>
        <div className='text-xs text-muted-foreground'>{merchant.code}</div>
      </div>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (status?: string) =>
      status ? (
        <TagComponent color={merchantStatus[status]?.color ?? 'default'}>
          {merchantStatus[status]?.label ?? 'Không xác định'}
        </TagComponent>
      ) : (
        '—'
      )
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 110,
    render: (_, merchant) => (
      <ButtonComponent
        htmlType='button'
        size='small'
        type={merchant.id === selectedId ? 'primary' : 'default'}
        content={merchant.id === selectedId ? 'Đã chọn' : 'Chọn'}
        aria-label={`Chọn Merchant ${merchant.name}`}
        onClick={() => onSelect(merchant)}
      />
    )
  }
]
