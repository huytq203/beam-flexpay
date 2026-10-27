import {
  CopyableText,
  FreezeAmountCell,
  FreezeRowActions,
  FreezeStatusCell,
  MaskText
} from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import {
  OWNER_TYPE_CONFIG,
  RELEASE_TYPE_LABEL,
  type OwnerType,
  type ReleaseType
} from '@constants/freeze.constant'
import { FreezeItem } from '@type/freeze.type'
import { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import WalletLink from '@components/wallet-link/WalletLink'

type FreezeRow = { no: number } & FreezeItem

interface ColumnOptions {
  onRelease?: (record: FreezeRow) => void
}

export const getColumn = ({
  onRelease
}: ColumnOptions): ColumnType<FreezeRow>[] => [
  {
    title: '#',
    align: 'center',
    dataIndex: 'no',
    key: 'no',
    width: 50
  },
  {
    title: 'Mã đóng băng',
    align: 'left',
    key: 'freezeCode',
    width: 170,
    render: (_, record) =>
      record.freezeCode ? (
        <CopyableText
          className='max-w-[150px]'
          value={record.freezeCode}
        />
      ) : (
        '—'
      )
  },
  {
    title: 'Khách hàng',
    align: 'left',
    key: 'customer',
    render: (_, record) => (
      <div className='flex flex-col gap-1'>
        <WalletLink walletId={record.accountId}>
          <MaskText
            active={true}
            value={record.ownerUsername}
          />
        </WalletLink>
        <StatusBadge
          className='text-[12px]'
          status={record.ownerType as OwnerType}
          config={OWNER_TYPE_CONFIG}
        />
      </div>
    )
  },
  {
    title: 'Số tiền đóng băng',
    align: 'right',
    key: 'amount',
    render: (_, record) => <FreezeAmountCell item={record} />
  },

  {
    title: 'Nguồn / Loại đóng băng',
    align: 'left',
    key: 'type',
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
          <p className='text-muted-foreground text-[12px]'>
            Lý do:{record.reason}
          </p>
        )}
      </div>
    )
  },
  {
    title: 'Trạng thái',
    align: 'center',
    key: 'displayStatus',
    render: (_, record) => <FreezeStatusCell item={record} />
  },
  {
    title: 'Cách mở băng',
    align: 'center',
    dataIndex: 'releaseType',
    key: 'releaseType',
    render: (releaseType: string | null) =>
      releaseType
        ? (RELEASE_TYPE_LABEL[releaseType as ReleaseType] ?? releaseType)
        : '--'
  },
  {
    title: 'Thời gian tạo',
    align: 'center',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (createdAt: string) =>
      createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '--'
  },
  {
    title: 'Lý do mở băng',
    align: 'left',
    key: 'unfreezeReason',
    width: 250,
    render: (_, record) => (
      <div className='max-w-[250px]'>
        <p>{record.unfreezeReason ?? '--'}</p>
      </div>
    )
  },
  {
    title: 'Hành động',
    align: 'center',
    fixed: 'right',
    key: 'action',
    width: 160,
    render: (_, record) => (
      <FreezeRowActions
        item={record}
        onRequestUnfreeze={() => onRelease?.(record)}
      />
    )
  }
]
