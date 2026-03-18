import { ButtonComponent, MaskText } from '@components/index'
import { FreezeItem } from '@type/freeze.type'
import { formatCurrency } from '@utils/formatNumber'
import { Tag } from 'antd'
import { ColumnType } from 'antd/lib/table'
import dayjs from 'dayjs'
import { FreezeType, FreezeTypeLabel, ReleaseType, ReleaseTypeLabel } from '../types/FrozenTransactions.type'

type FreezeRow = { no: number } & FreezeItem

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: 'blue', label: 'Đang đóng băng' },
    CAPTURED: { color: 'green', label: 'Đã thu' },
    RELEASED: { color: 'default', label: 'Đã giải tỏa' },
    EXPIRED: { color: 'orange', label: 'Hết hạn' },
    CANCELLED: { color: 'red', label: 'Đã hủy' },
}

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
        align: 'center',
        key: 'source',
        render: (_, record) => (
            <div>
                <p className="font-medium">{ReleaseTypeLabel[record.type as ReleaseType]}</p>
                <p className="text-gray-500 text-xs">{record.reason}</p>
            </div>
        ),
    },
    {
        title: 'Khách hàng',
        align: 'center',
        key: 'customer',
        render: (_, record) => (
            <div>
                <MaskText active={true} value={record.ownerUsername} />
                <p className="text-gray-500 text-xs">{record.ownerType ?? '--'}</p>
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
        title: 'Lý do mở băng',
        align: 'center',
        key: 'unfreezeReason',
        render: (_, record) => (
            <div className="text-center">
                <p>{record.unfreezeReason ?? '--'}</p>
            </div>
        ),
    },
    {
        title: 'Trạng thái',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
            const config = STATUS_CONFIG[status] ?? { color: 'default', label: status }
            return <Tag color={config.color}>{config.label}</Tag>
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