import { ColumnType } from 'antd/es/table'

export const Column =():ColumnType[]=> [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center'
    },
    {
        title: 'Đối tượng áp dụng',
        dataIndex:'',
        align: 'center'
    },
    {
        title: 'Tài khoản',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Loại giao dịch',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Phương thức',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Mức giao dịch từ - đến',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Công thức tính',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Min/Max',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thời gian tạo',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thời gian áp dụng',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thời gian kết thúc',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Trạng thái',
        dataIndex:'',
        align: 'center',
    },
]

