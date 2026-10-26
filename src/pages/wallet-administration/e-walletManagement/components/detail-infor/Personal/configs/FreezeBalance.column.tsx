import {
  FreezeAmountCell,
  FreezeRowActions,
  FreezeStatusCell
} from '@components/index'
import { FREEZE_TYPE_LABEL, type FreezeType } from '@constants/freeze.constant'
import { FreezeItem } from '@type/freeze.type'
import { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'

interface ColumnProps {
  onRelease?: (record: FreezeItem) => void
}

export const getColumn = ({
  onRelease
}: ColumnProps): ColumnType<FreezeItem>[] => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 60
  },
  {
    title: 'Số tiền',
    key: 'amount',
    align: 'right',
    width: 200,
    render: (_, record) => <FreezeAmountCell item={record} />
  },
  {
    title: 'Loại đóng băng',
    dataIndex: 'type',
    align: 'left',
    width: 180,
    render: (value: string) => FREEZE_TYPE_LABEL[value as FreezeType] ?? value
  },
  {
    title: 'Lý do đóng băng',
    dataIndex: 'reason',
    align: 'left',
    width: 250,
    render: (value: string | null) =>
      value ? <span className='inline-block max-w-[250px]'>{value}</span> : '--'
  },
  {
    title: 'Lý do mở băng',
    dataIndex: 'unfreezeReason',
    align: 'left',
    width: 250,
    render: (value: string | null) =>
      value ? <span className='inline-block max-w-[250px]'>{value}</span> : '--'
  },
  {
    title: 'Thời gian tạo',
    dataIndex: 'createdAt',
    align: 'center',
    width: 200,
    render: (value: string) =>
      value ? dayjs(value).format('DD/MM/YYYY HH:mm:ss') : '--'
  },
  {
    title: 'Thời gian cập nhật',
    dataIndex: 'updatedAt',
    align: 'center',
    width: 200,
    render: (value: string) =>
      value ? dayjs(value).format('DD/MM/YYYY HH:mm:ss') : '--'
  },
  {
    title: 'Trạng thái',
    key: 'displayStatus',
    align: 'center',
    width: 160,
    render: (_, record) => <FreezeStatusCell item={record} />
  },
  {
    title: 'Thao tác',
    key: 'action',
    align: 'center',
    width: 160,
    render: (_, record) => (
      <FreezeRowActions
        item={record}
        onRequestUnfreeze={onRelease}
      />
    )
  }
]
