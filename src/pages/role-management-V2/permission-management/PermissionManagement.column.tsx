import { ButtonComponent } from '@components/common'
import React from 'react'
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
  LockOutlined,
  UserOutlined,
  UserSwitchOutlined
} from '@components/icons/common'
import { ColumnType } from 'antd/lib/table'
import { ModeAction } from './hook/usePermissionRole'
import { PermissionItem } from '@type/permissionManagement'
interface props {
  setOpenModalDetail: (value: boolean) => void
  setOpenModalPermission: (value: boolean) => void
  setOpenModalAdd: (value: boolean) => void
  setModeAction: (value: ModeAction) => void
  setModalDialog: (value: boolean) => void
  handleGetMemberOfRole: (value: string) => void
  handleGetPermissionAvailable: (value: string) => void
  handleGetPermissionAssigned: (value: string) => void
}

export const PermissionManagementColumn = ({
  setOpenModalDetail,
  setOpenModalAdd,
  setModeAction,
  setModalDialog,
  handleGetMemberOfRole,
  handleGetPermissionAvailable,
  setOpenModalPermission,
  handleGetPermissionAssigned
}: props): ColumnType<any>[] => [
    {
      title: '#',
      dataIndex: 'no',
      align: 'center'
    },
    {
      title: 'Tên nhóm quyền',
      dataIndex: 'name',
      align: 'center'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      align: 'center'
    },
    {
      title: 'Ngày khởi tạo ',
      dataIndex: 'date',
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
                setModeAction('edit')
                setOpenModalPermission(true)
                handleGetPermissionAssigned(record.id)
              }}
            />
            <ButtonComponent
              type='default'
              className='text-blue-600 '
              icon={<EyeOutlined />}
              onClick={() => {
                setModeAction('view')
                handleGetPermissionAssigned(record.id)
                setOpenModalPermission(true)
              }}
            />
            <ButtonComponent
              type='default'
              className='text-yellow-600 '
              icon={<LockOutlined />}
              onClick={() => {
                setModeAction('lock')
                setModalDialog(true)
              }}
            />
            <ButtonComponent
              type='default'
              className='text-green-600'
              icon={<UserOutlined />}
              onClick={() => {
                setOpenModalDetail(true)
                handleGetMemberOfRole(record.id)
              }}
            />
            <ButtonComponent
              type='default'
              className='text-red-600 '
              icon={<DeleteOutlined />}
              onClick={() => {
                setModeAction('delete')
                setModalDialog(true)
              }}
            />
            <ButtonComponent
              type='default'
              className='text-violet-600 '
              icon={<ApartmentOutlined />}
              onClick={() => {
                setModeAction('permission')
                handleGetPermissionAvailable(record.id)
                setOpenModalPermission(true)
              }}
            />
          </div>
        )
      }
    }
  ]
