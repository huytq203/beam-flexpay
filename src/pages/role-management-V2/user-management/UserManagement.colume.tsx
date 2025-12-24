import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
  LockOutlined,
  UserSwitchOutlined
} from '@components/icons/common'
import { ButtonComponent } from '@components/common'
import { UserInfor } from '@type/userManagement'
import { ColumnType } from 'antd/lib/table'

import React from 'react'
import { ActionMode } from './UserManagement'

interface props {
  setOpenModalDetail: (record: boolean) => void
  setOpenDialog: (record: boolean) => void
  setModeAction: (value: ActionMode) => void
  handleOpenDetail:(record:UserInfor)=>void
}

export const RoleManagemenColume = ({
  setOpenModalDetail,
  setModeAction,
  setOpenDialog,
  handleOpenDetail
}: props): ColumnType<UserInfor>[] => [
  {
    title: 'STT',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Tên đăng nhập',
    dataIndex: 'username',
    align: 'center'
  },
  {
    title: 'Họ và tên',
    dataIndex: 'firstName',
    align: 'center'
  },
  {
    title: 'Email',
    dataIndex: 'email',
    align: 'center'
  },

  {
    title: 'lastName',
    dataIndex: 'lastName',
    align: 'center'
  },
 
  {
    title: 'emailVerified',
    dataIndex: 'emailVerified',
    align: 'center'
  },
  {
    title: 'Nhóm quyền',
    dataIndex: 'groups',
    align: 'center'
  },
   {
    title: 'Trạng thái',
    dataIndex: 'enabled',
    align: 'center'
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdTimestamp',
    align: 'center',

    render: (value: Date | null) => {
      if (!value) return '-'
      return value.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  },
  {
    title: 'Thao tác',
    dataIndex: 'action',
    align: 'center',
    width: 300,
    fixed: 'right',
    render(value, record, index) {
      return (
        <div className='flex justify-center items-center gap-1'>
          <ButtonComponent
            type='default'
            className=''
            icon={<EditOutlined />}
          />
          <ButtonComponent
            type='default'
            className='text-blue-600 '
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record)}
          />
          <ButtonComponent
            type='default'
            className='text-yellow-600 '
            icon={<LockOutlined />}
            onClick={() => {
              setModeAction('lock')
              setOpenDialog(true)
            }}
          />
          <ButtonComponent
            type='default'
            className='text-red-600 '
            icon={<DeleteOutlined />}
            onClick={() => {
              setModeAction('delete')
              setOpenDialog(true)
            }}
          />
          <ButtonComponent
            type='default'
            className='text-green-600 '
            icon={<UserSwitchOutlined />}
          />
          <ButtonComponent
            type='default'
            className='text-violet-600 '
            icon={<KeyOutlined />}
            onClick={() => {
              setModeAction('resetPass')
              setOpenDialog(true)
            }}
          />
        </div>
      )
    }
  }
]
