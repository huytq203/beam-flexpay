import { ColumnType } from 'antd/es/table'
import React from 'react'

export const Column =():ColumnType[]=> [
    {
        title: 'STT',
        dataIndex: 'no',
        align: 'center'
    },
    {
        title: 'Mã đóng băng',
        dataIndex:'',
        align: 'center'
    },
    {
        title: 'Mã GD gốc',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Số tiền',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Lý do đóng băng',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thời gian tạo',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Trạng thái',
        dataIndex:'',
        align: 'center',
    },
    {
        title: 'Thao tác',
        dataIndex:'',
        align: 'center',
    },
]

