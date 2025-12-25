import { DeleteOutlined, EditOutlined, LockOutlined } from '@components/icons/common'
import { ButtonComponent } from '@components/common'
import { ColumnType } from 'antd/lib/table'
import React from 'react'
import { RoleDataItem } from '@type/roleManagementV2'
import { ModeAction } from './hook/useRoleManagement'
interface props {
  setModeAction: (value: ModeAction) => void
  setOpenModalAdd: (value: boolean) => void
  setOpenDialog: (value: boolean) => void
  setSelectedUser: (value: RoleDataItem) => void
}
export const RoleManagementColumn = ({ setModeAction, setOpenModalAdd, setSelectedUser, setOpenDialog }: props): ColumnType<RoleDataItem>[] => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Tên quyền',
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: 'Mã quyền ',
    dataIndex: 'description',
    align: 'center'
  },
  {
    title: 'Ngày khởi tạo ',
    dataIndex: '',
    align: 'center'
  },
  {
    title: 'Trạng thái ',
    dataIndex: '',
    align: 'center'
  },
  {
    title: 'Thao tác  ',
    dataIndex: 'action',
    align: 'center',

    width: 100,
    fixed: 'right',
    render(value, record, index) {
      return (
        <div className='flex justify-center items-center gap-1'>
          <ButtonComponent
            type='default'
            className=''
            icon={<EditOutlined />}
            onClick={() => {
              setModeAction('update')
              setOpenModalAdd(true)
              setSelectedUser(record)
            }}
          />

          <ButtonComponent
            type='default'
            className='text-yellow-600 '
            icon={<LockOutlined />}
          />
          <ButtonComponent
            type='default'
            className='text-red-600 '
            icon={<DeleteOutlined />}
            onClick={() => {
              setModeAction('delete')
              setOpenDialog(true)
              setSelectedUser(record)
            }}
          />
        </div>
      )
    }
  }
]
