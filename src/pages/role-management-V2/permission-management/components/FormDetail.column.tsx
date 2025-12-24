import { ColumnType } from "antd/lib/table";

export const FormDetailColumn = ():ColumnType<any>[] => [
  {
    title: 'Tên tài khoản',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Email',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'no',
    align: 'center'
  },
]
