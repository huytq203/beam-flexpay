import type { ColumnsType } from 'antd/es/table'
import type { ApiParentMerchant } from '@/app/services/merchantHierarchyApi'
import { ButtonComponent } from '@components/index'

interface ParentMerchantPickerColumnOptions {
  page: number
  size: number
  selectedId?: string
  onSelect: (merchant: ApiParentMerchant) => void
}

export const createParentMerchantPickerColumns = ({
  page,
  size,
  selectedId,
  onSelect
}: ParentMerchantPickerColumnOptions): ColumnsType<ApiParentMerchant> => [
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
    title: 'Số điện thoại',
    dataIndex: 'contactPhone',
    width: 150,
    render: (phone?: string) => (
      <span className='text-sm tabular-nums text-foreground'>
        {phone || '—'}
      </span>
    )
  },
  {
    title: 'Địa chỉ',
    dataIndex: 'address',
    render: (address?: string) => (
      <span className='line-clamp-2 text-sm text-foreground'>
        {address || '—'}
      </span>
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 110,
    render: (_, merchant) => {
      const isSelected = merchant.id === selectedId
      return (
        <ButtonComponent
          htmlType='button'
          size='small'
          type={isSelected ? 'primary' : 'default'}
          content={isSelected ? 'Đã chọn' : 'Chọn'}
          aria-label={`Chọn Merchant ${merchant.name}`}
          onClick={() => onSelect(merchant)}
        />
      )
    }
  }
]
