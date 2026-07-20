import { ButtonComponent, MaskText } from '@components/index'
import { FreezeItem } from '@type/freeze.type'
import { formatCurrency } from '@utils/formatNumber'
import { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import { ReleaseType, ReleaseTypeLabel } from '../types/FrozenTransactions.type'
import { CONFIG_LABEL_OWNER_TYPE, STATUS_CONFIG, StatusKey, typeLock, typeLockLabel } from '../constants/FrozenTransaction.constant'
import StatusBadge from '@components/status-badge/StatusBadge'
import { cn } from '@utils/cn'

type FreezeRow = { no: number } & FreezeItem

interface ColumnOptions {
    onRelease?: (record: FreezeRow) => void
}

export const getColumn = ({ onRelease }: ColumnOptions = {}): ColumnType<FreezeRow>[] => [
    {
        title: '#',
        align: 'center',
        dataIndex: 'no',
        key: 'no',
        width: 50,
    },
    {
        title: 'Nguồn / Loại GD',
        align: 'left',
        key: 'source',
        render: (_, record) => (
            <div>
                <p className="font-medium">{ReleaseTypeLabel[record.type as ReleaseType]}</p>
                <p className="text-gray-500 text-[12px]">{record.reason}</p>
            </div>
        ),
    },
    {
        title: 'Khách hàng',
        align: 'left',
        key: 'customer',
        render: (_, record) => (
            <div className='flex flex-col '>
                <MaskText active={true} value={record.ownerUsername} />
                <StatusBadge className="text-gray-500 text-[12px]" status={record.ownerType}  config={CONFIG_LABEL_OWNER_TYPE}/>
            </div>
        ),
    },
    {
        title: 'Số tiền đóng băng',
        align: 'right',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount: number) => (
            <span className="font-medium text-orange-600">
                {formatCurrency(amount, { symbol: 'VNĐ', position: 'after' })}
            </span>
        ),
    },
   
    {
        title: 'Loại đóng băng',
        align: 'center',
        dataIndex: 'type',
        render: (_, record) => (
            <div>
                <p className='font-medium text-gray-500'>{typeLockLabel[record.type as typeLock]}</p>

            </div>
        ),
    },

    {
        title: 'Trạng thái',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
            return (
                <div className='space-y-1'>
              <StatusBadge className={cn(status==StatusKey.ACTIVE&&'animate-pulse-soft')} status={status} config={STATUS_CONFIG}/>
                </div>
            )
        },
    },
    {
        title: 'Thời gian tạo',
        align: 'center',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt: string) =>
            createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '--',
    },
     {
        title: 'Lý do mở băng',
        align: 'left',
        key: 'unfreezeReason',
        width: 250,
        render: (_, record) => (
            <div className="max-w-[250px]">
                <p>{record.unfreezeReason ?? '--'}</p>
            </div>
        ),
    },
    {
        title: 'Hành động',
        align: 'center',
        key: 'action',
        width: 110,
        render: (_, record) => {
            const canRelease = record.status === 'ACTIVE'
            return (
                <ButtonComponent
                    size="small"
                    disabled={!canRelease}
                    onClick={() => canRelease && onRelease?.(record)}
                    className={`bg-blue-50 border border-blue-600 text-blue-600 ${canRelease
                        ? 'hover:!bg-blue-100 hover:!text-blue-700'
                        : 'opacity-50 cursor-not-allowed'
                        }`}
                    content="Mở băng"
                />
            )
        },
    },
]