import { DeleteOutlined, EditOutlined, LockOutlined } from '@components/icons/common'
import { ButtonComponent } from '@components/common'
import { ColumnType } from 'antd/lib/table'
import React from 'react'
import { RoleDataItem } from '@type/roleManagementV2'
import { ModeAction } from './hook/useRoleManagement'
import { PermissionItem } from '@type/permissionManagement'
interface props {
  setModeAction: (value: ModeAction) => void
  setOpenModalAdd: (value: boolean) => void
  setOpenDialog: (value: boolean) => void
  setSelectedPermission: (value: PermissionItem) => void
}
export const RoleManagementColumn = ({ setModeAction, setOpenModalAdd, setSelectedPermission, setOpenDialog }: props): ColumnType<RoleDataItem>[] => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    render(value, record, index) {
      return value ?? '--'
    }
  },
  {
    title: 'Tên quyền',
    dataIndex: 'name',
    align: 'center',
    render(value, record, index) {
      return value ?? '--'
    }
  },
  {
    title: 'Mã quyền ',
    dataIndex: '',
    align: 'center',
    render(value, record, index) {
      return value ?? '--'
    }
  },
  {
    title: 'Ngày khởi tạo ',
    dataIndex: '',
    align: 'center',
    render(value, record, index) {
      return value ?? '--'
    }
  },
  {
    title: 'Trạng thái ',
    dataIndex: 'description',
    align: 'center',
    render(value, record, index) {
      return value ?? '--'
    }
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
              setSelectedPermission(record)
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
              setSelectedPermission(record)
            }}
          />
        </div>
      )
    }
  }
]
