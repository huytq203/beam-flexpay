import CopyableText from '@components/ui/copytext-component'
import type { FreezeItem } from '@type/freeze.type'
import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import { FreezeAmountCell } from './FreezeAmountCell'
import { FreezeRowActions } from './FreezeRowActions'
import { FreezeStatusCell } from './FreezeStatusCell'

export type FreezeBalanceRow = FreezeItem & { no?: number }

interface FreezeBalanceColumnOptions {
  onRelease?: (record: FreezeItem) => void
}

const formatDateTime = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm:ss') : '--'

/** Bảng "Lịch sử đóng/mở băng" trong chi tiết ví, dùng chung cho ví cá nhân và ví doanh nghiệp. */
export const getFreezeBalanceColumns = ({
  onRelease
}: FreezeBalanceColumnOptions): ColumnType<FreezeBalanceRow>[] => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 60
  },
  {
    title: 'Mã đóng băng',
    key: 'freezeCode',
    align: 'left',
    width: 170,
    render: (_, record) =>
      record.freezeCode ? (
        <CopyableText
          className='max-w-[150px]'
          value={record.freezeCode}
        />
      ) : (
        '--'
      )
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
    key: 'type',
    align: 'left',
    width: 260,
    render: (_, record) => (
      <div className='max-w-[260px]'>
        <p className='font-medium'>
          {record.sourceTransactionId === null
            ? 'Đóng băng số dư'
            : 'Đóng băng giao dịch'}
        </p>
        {record.sourceTransactionCode && (
          <p className='text-[12px] text-muted-foreground'>
            Mã giao dịch gốc: {record.sourceTransactionCode}
          </p>
        )}
        {record.reason && (
          <p className='text-[12px] text-muted-foreground'>
            Lý do: {record.reason}
          </p>
        )}
      </div>
    )
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
    width: 180,
    render: formatDateTime
  },
  {
    title: 'Thời gian cập nhật',
    dataIndex: 'updatedAt',
    align: 'center',
    width: 180,
    render: formatDateTime
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
    fixed: 'right',
    width: 100,
    render: (_, record) => (
      <FreezeRowActions
        item={record}
        onRequestUnfreeze={onRelease}
      />
    )
  }
]
