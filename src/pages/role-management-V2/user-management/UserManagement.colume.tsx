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
}

export const RoleManagemenColume = ({
  setOpenModalDetail,
  setModeAction,
  setOpenDialog
}: props): ColumnType<UserInfor>[] =>
  [
    {
      title: 'STT',
      dataIndex: 'no',
      align: 'center',
      className: 'border'
    },
    {
      title: 'username',
      dataIndex: 'username',
      align: 'center',
      className: 'border border-l-0  border-b-0'
    },
    {
      title: 'email',
      dataIndex: 'email',
      align: 'center',
      className: 'border border-l-0  border-b-0'
    },
    {
      title: 'firstName',
      dataIndex: 'firstName',
      align: 'center',
      className: 'border border-l-0  border-b-0'
    },
    {
      title: 'lastName',
      dataIndex: 'lastName',
      align: 'center',
      className: 'border border-l-0  border-b-0'
    },
    {
      title: 'enabled',
      dataIndex: 'enabled',
      align: 'center',
      className: 'border border-l-0  border-b-0'
    },
    {
      title: 'emailVerified',
      dataIndex: 'emailVerified',
      align: 'center',
      className: 'border border-l-0  border-b-0'
    },
    {
      title: 'groups',
      dataIndex: 'groups',
      align: 'center',
      className: 'border border-l-0  border-b-0'
    },
    {
      title: 'createdTimestamp',
      dataIndex: 'createdTimestamp',
      align: 'center',
      className: 'border border-l-0  border-b-0',
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
      title: 'action',
      dataIndex: 'action',
      align: 'center',
      className: 'border border-l-0 border-b-0',
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
              onClick={() => setOpenModalDetail(true)}
            />
            <ButtonComponent
              type='default'
              className='text-yellow-600 '
              icon={<LockOutlined />}
              onClick={() => {
                setModeAction("lock")
                setOpenDialog(true)
              }}
            />
            <ButtonComponent
              type='default'
              className='text-red-600 '
              icon={<DeleteOutlined />}
              onClick={() => {
                setModeAction("delete")
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
                setModeAction("resetPass")
                setOpenDialog(true)
              }}
            />
          </div>
        )
      }
    }
  ]




