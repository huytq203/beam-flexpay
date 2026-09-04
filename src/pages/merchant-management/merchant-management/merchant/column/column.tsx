import { ColumnType } from 'antd/es/table'
import { ContentMerchant } from '@type/merchant'
import dayjs from 'dayjs'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { EditOutlined, EyeOutlined } from '@components/icons'
import { StatusKey } from '@pages/wallet-administration/e-walletManagement/constants/Ewallet.constant'
import StatusBadge from '@components/status-badge/StatusBadge'
import { STATUS_CONFIG } from '../constants/Merchant.constant'
import { Can } from '@/app/permissions'

interface MerchantColumnProps {
    onEdit: (id: string) => void
    onView?: (id: string) => void
}

export const MerchantColumn = ({ onEdit, onView }: MerchantColumnProps): ColumnType<ContentMerchant>[] => [
    {
        title: '#',
        dataIndex: 'stt',
        align: 'center'
    },
    {
        title: 'Tên merchant',
        dataIndex: 'name',
        align: 'center'
    },
    {
        title: 'Mã merchant',
        dataIndex: 'code',
        align: 'center'
    },
    {
        title: 'Liên hệ',
        align: 'left',
        render: (_: unknown, record: ContentMerchant) => (
            <div>
                <div><span className='font-medium'>Email:</span> {record.contactEmail}</div>
                <div><span className='font-medium'>SĐT:</span> {record.contactPhone}</div>
            </div>
        )
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render: (value: StatusKey) => <StatusBadge status={value} config={STATUS_CONFIG} />,
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        align: 'center',
        render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm:ss')
    },
    {
        title: 'Thao tác',
        align: 'center',
        width: 50,
        fixed: 'right',
        render: (_: unknown, record: ContentMerchant) => (
            <div className='flex gap-1 items-center justify-center'>
                <Can screen='MERCHANT_MANAGEMENT' action='viewDetail'>
                    <TooltipComponent title='Xem chi tiết'>
                        <ButtonComponent aria-label='Xem chi tiết merchant' size='small' type='default' icon={<EyeOutlined />} onClick={() => onView?.(record.id)} />
                    </TooltipComponent>
                </Can>
                <Can screen='MERCHANT_MANAGEMENT' action='edit'>
                    <TooltipComponent title='Sửa'>
                        <ButtonComponent aria-label='Sửa merchant' size='small' type='default' icon={<EditOutlined />} onClick={() => onEdit(record.id)} />
                    </TooltipComponent>
                </Can>
            </div>
        )
    }
]
