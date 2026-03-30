import { ColumnType } from 'antd/es/table'
import React from 'react'

const Column = (): ColumnType[] => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center'
    },
    {
        title: 'Bước hạch toán',
        dataIndex: '',
        align: 'center'
    },
    {
        title: 'Ví nguồn (DEBIT)',
        dataIndex: '',
        align: 'center',
    },
    {
        title: 'Ví đích (CREDIT)',
        dataIndex: '',
        align: 'center',
    },
    {
        title: 'Số tiền',
        dataIndex: '',
        align: 'center',
    },
]

export default Column