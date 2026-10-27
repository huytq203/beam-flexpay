import { EyeOutlined } from '@components/icons'
import { TagComponent } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import {
  FREQUENCY_LABEL,
  MODE_LABEL
} from '../../merchant-settlement/constants/settlementConfig.constants'
import { AccessActionButton } from '../../merchant-access/components/AccessActionButton'
import { formatOrderDateTime } from '../../merchant-order/utils/merchantOrder.utils'
import { CONFIG_SOURCE_LABEL } from '../constants/settlementScope.constants'
import type { ConfigListRow } from '../types/settlementScope.types'

interface Options {
  page: number
  pageSize: number
  onOpen: (row: ConfigListRow) => void
}

/** `#` tính theo trang và kích thước trang vì BE phân trang (page từ 1). */
export const createMasterConfigColumns = ({
  page,
  pageSize,
  onOpen
}: Options): NonNullable<TableComponentProps<ConfigListRow>['columns']> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Merchant',
    width: 240,
    render: (_, row) => (
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {row.merchantName}
        </div>
        <div className='text-xs text-muted-foreground'>{row.merchantCode}</div>
      </div>
    )
  },
  {
    title: 'Nguồn cấu hình',
    width: 160,
    render: (_, row) => (
      <TagComponent color={row.source === 'OWN' ? 'blue' : 'default'}>
        {CONFIG_SOURCE_LABEL[row.source] ?? row.source}
      </TagComponent>
    )
  },
  {
    title: 'Chế độ',
    width: 170,
    render: (_, row) =>
      row.settlementMode.value ? MODE_LABEL[row.settlementMode.value] : '—'
  },
  {
    title: 'Tần suất',
    width: 150,
    render: (_, row) =>
      row.autoFrequency.value ? FREQUENCY_LABEL[row.autoFrequency.value] : '—'
  },
  {
    title: 'T+N (ngày)',
    align: 'right',
    width: 110,
    render: (_, row) => row.holdbackDays.value ?? '—'
  },
  {
    title: 'Đang áp dụng',
    align: 'center',
    width: 130,
    render: (_, row) => (row.active ? 'Có' : 'Không')
  },
  {
    title: 'Số lần đổi',
    align: 'right',
    width: 110,
    render: (_, row) => row.version
  },
  {
    title: 'Cập nhật',
    width: 180,
    render: (_, row) => formatOrderDateTime(row.updatedAt)
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 90,
    render: (_, row) => (
      <AccessActionButton
        label='Xem cấu hình Master'
        icon={<EyeOutlined aria-hidden />}
        onClick={() => onOpen(row)}
      />
    )
  }
]
