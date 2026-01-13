import { ColumnsType } from 'antd/lib/table'
import React from 'react'

const Column = ():ColumnsType => [
  {
    title: '#',
    align: 'center'
  },
  {
    title: 'Mã tham chiếu',
    align: 'center'
  },
  {
    title: 'Khách hàng',
    align: 'center'
  },
  {
    title: 'Số tiền giao dịch',
    align: 'center'
  },
  {
    title: 'Thực nhận và phí',
    align: 'center'
  },
  {
    title: 'Kênh và nguồn',
    align: 'center'
  },
  {
    title: 'Thời gian',
    align: 'center'
  },
  {
    title: 'Trạng thái',
    align: 'center'
  },
  {
    title: 'Thao tác',
    align: 'center'
  },
]

export default Column
