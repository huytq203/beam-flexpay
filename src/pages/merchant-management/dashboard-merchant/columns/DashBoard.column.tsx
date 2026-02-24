import { ColumnType } from 'antd/es/table'
import { MerchanOrderItem } from '@pages/merchant-management/merchant-order/types/apiOrder.type'
import dayjs from 'dayjs'
import { formatNumber } from '@utils/formatNumber'

const orderStatus: Record<string, { label: string; className: string }> = {
    SUCCESS: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700 border border-green-300' },
    ACTIVE:  { label: 'Khởi tạo',  className: 'bg-blue-100  text-blue-700  border border-blue-300'  },
    FAILED:  { label: 'Thất bại',  className: 'bg-red-100   text-red-700   border border-red-300'   },
    EXPIRED: { label: 'Hết hạn',   className: 'bg-gray-100  text-gray-600  border border-gray-300'  },
}

export const DashBoarColumn = (): ColumnType<MerchanOrderItem>[] => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center',
        width: 50,
        render: (_value, _record, index) => index + 1,
    },
    {
        title: 'Mã đơn hàng',
        dataIndex: 'orderCode',
        align: 'center',
        render: (value: string) => (
            <span className='font-medium text-blue-600'>{value || '--'}</span>
        ),
    },
    {
        title: 'Mô tả',
        dataIndex: 'orderDescription',
        align: 'center',
        render: (value: string) => (
            <span className='text-gray-600 text-[12px]'>{value || '--'}</span>
        ),
    },
    {
        title: 'Số tiền',
        dataIndex: 'amount',
        align: 'center',
        render: (value: number, record: MerchanOrderItem) => (
            <span className='font-semibold text-green-700'>
                {formatNumber(value)} {record.currency}
            </span>
        ),
    },
    {
        title: 'Ngân hàng',
        dataIndex: 'bankCode',
        align: 'center',
        render: (value: string) => (
            <span className='font-medium'>{value || '--'}</span>
        ),
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render: (value: string) => {
            const s = orderStatus[value]
            return (
                <span className={`px-2 py-0.5 rounded text-[12px] font-medium whitespace-nowrap ${s?.className ?? 'bg-gray-100 text-gray-500'}`}>
                    {s?.label ?? value}
                </span>
            )
        },
    },
    {
        title: 'Thời gian tạo',
        dataIndex: 'createdAt',
        align: 'center',
        render: (value: string) => (
            <span className='text-gray-500 text-[12px]'>
                {value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '--'}
            </span>
        ),
    },
]
