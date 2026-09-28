import type { ColumnsType } from 'antd/es/table'
import type { ApiSubMerchantSummary } from '@/app/services/merchantHierarchyApi'
import { ButtonComponent } from '@components/index'
import { ManagementStatusTag } from './ManagementStatusTag'

interface SubMerchantPickerColumnOptions {
  page: number
  size: number
  selectedId?: string
  onSelect: (subMerchant: ApiSubMerchantSummary) => void
}

export const createSubMerchantPickerColumns = ({
  page,
  size,
  selectedId,
  onSelect
}: SubMerchantPickerColumnOptions): ColumnsType<ApiSubMerchantSummary> => [
  {
    title: '#',
    align: 'center',
    width: 60,
    render: (_value, _row, index) => (page - 1) * size + index + 1
  },
  {
    title: 'Sub-merchant',
    render: (_, sub) => (
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {sub.name}
        </div>
        <div className='text-xs text-muted-foreground'>{sub.code}</div>
      </div>
    )
  },
  {
    title: 'Merchant cha',
    render: (_, sub) => (
      <div className='min-w-0'>
        <div className='truncate text-sm text-foreground'>
          {sub.merchantName || '—'}
        </div>
        <div className='text-xs text-muted-foreground'>{sub.merchantCode}</div>
      </div>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 140,
    render: (status: ApiSubMerchantSummary['status']) => (
      <ManagementStatusTag status={status} />
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 110,
    render: (_, sub) => {
      const isSelected = sub.id === selectedId
      return (
        <ButtonComponent
          htmlType='button'
          size='small'
          type={isSelected ? 'primary' : 'default'}
          content={isSelected ? 'Đã chọn' : 'Chọn'}
          aria-label={`Chọn Sub-merchant ${sub.name}`}
          onClick={() => onSelect(sub)}
        />
      )
    }
  }
]
