import { ButtonComponent } from '@components/index'
import { FreezeItem } from '@type/freezeAccount'
import { formatCurrency } from '@utils/formatNumber'
import { Tag } from 'antd'
import { ColumnType } from 'antd/lib/table'
import dayjs from 'dayjs'

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

export const Column = ({ onRelease }: ColumnOptions = {}): ColumnType<FreezeRow>[] => [
    {
        title: '#',
        align: 'center',
        dataIndex: 'no',
        key: 'no',
        width: 50,
    },
    // {
    //     title: 'Mã đóng băng',
    //     align: 'center',
    //     dataIndex: 'id',
    //     key: 'id',
    //     render: (id: string) => (
    //         <span className="font-mono text-xs text-gray-600">{id}</span>
    //     ),
    // },
    {
        title: 'Nguồn / Loại GD',
        align: 'center',
        key: 'source',
        render: (_, record) => (
            <div>
                <p className="font-medium">{record.type}</p>
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
                <p className="font-medium">{record.account?.ownerUsername ?? '--'}</p>
                <p className="text-gray-500 text-xs">{record.account?.ownerType ?? '--'}</p>
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
        title: 'Số dư ví',
        align: 'right',
        key: 'balance',
        render: (_, record) => (
            <div className="text-right">
                <p>{formatCurrency(record.account?.balance ?? 0, { symbol: 'VNĐ', position: 'after' })}</p>
                <p className="text-xs text-gray-500">
                    Hold: {formatCurrency(record.account?.holdBalance ?? 0, { symbol: 'VNĐ', position: 'after' })}
                </p>
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