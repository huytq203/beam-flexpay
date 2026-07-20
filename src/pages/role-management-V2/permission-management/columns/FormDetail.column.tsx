import { ColumnType } from 'antd/es/table'

interface UserTableRow {
  username: string
  email: string | null
  emailVerified: boolean
}

export const FormDetailColumn = (): ColumnType<UserTableRow>[] => [
  {
    title: 'Tên tài khoản',
    dataIndex: 'username',
    align: 'center'
  },
  {
    title: 'Email',
    dataIndex: 'email',
    align: 'center'
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'emailVerified',
    align: 'center'
  }
]
