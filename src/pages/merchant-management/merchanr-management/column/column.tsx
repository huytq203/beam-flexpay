import { ColumnType } from 'antd/lib/table'
import { ContentMerchant } from '@type/merchant'
import dayjs from 'dayjs'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { EditOutlined, EyeOutlined, LockOutlined } from '@components/icons'
import { StatusKey } from '@pages/wallet-administration/e-walletManagement/constants/Ewallet.constant'
import StatusBadge from '@components/status-badge/StatusBadge'

interface MerchantColumnProps {
    onEdit: (id: string) => void
}



export const MerchantColumn = ({ onEdit }: MerchantColumnProps): ColumnType<ContentMerchant>[] => [
    {
        title: 'STT',
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
        render: (value: StatusKey) => <StatusBadge status={value} />,
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
                <TooltipComponent title='Xem chi tiết'>
                    <ButtonComponent size='small' type='default' icon={<EyeOutlined />} onClick={() => { }} />
                </TooltipComponent>
                <TooltipComponent title='Sửa'>
                    <ButtonComponent size='small' type='default' icon={<EditOutlined />} onClick={() => onEdit(record.id)} />
                </TooltipComponent>
                <TooltipComponent title='Khóa'>
                    <ButtonComponent size='small' type='default' icon={<LockOutlined />} onClick={() => { }} />
                </TooltipComponent>
            </div>
        )
    }
]
