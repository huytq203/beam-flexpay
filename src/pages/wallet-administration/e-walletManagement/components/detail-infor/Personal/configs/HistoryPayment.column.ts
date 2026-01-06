import { ColumnType } from 'antd/es/table'
import React from 'react'

export const Column =():ColumnType[]=> [
    {
        title: 'STT',
        dataIndex: 'no',
        align: 'center'
    },
    {
        title: 'Mã giao dịch',
        dataIndex:'',
        align: 'center'
    },
    {
        title: 'Loại giao dịch',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Số tiền',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thời gian tạo',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thời gian thành công',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thời gian thành công',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thời gian thành công',
        dataIndex:'',
        align: 'center',
    },
]

