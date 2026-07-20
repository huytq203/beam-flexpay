import { ColumnType } from 'antd/es/table'

export const Column = (): ColumnType[] => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center'
    },
    {
        title: 'Ngân hàng',
        dataIndex: '',
        align: 'center'
    },
    {
        title: 'Số tài khoản',
        dataIndex: '',
        align: 'center',
    },
    {
        title: 'Tên tài khoản',
        dataIndex: '',
        align: 'center',
    },
    {
        title: 'Trạng thái',
        dataIndex: '',
        align: 'center',
    },
    {
        title: 'Thao tác',
        dataIndex: '',
        align: 'center',
    },
]
