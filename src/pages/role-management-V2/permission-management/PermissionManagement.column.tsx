import { ButtonComponent } from '@components/common'
import { PermissionWrapper } from '@components/permission-wrapper'
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined
} from '@components/icons/common'
import { ColumnType } from 'antd/lib/table'
import { ModeAction } from './hooks/usePermissionRole'
import { PermissionItem } from '@type/permissionManagement'
import { DataRoleItem } from '@type/roleManagement'
import { Permission } from '@constants/permissionConstant'

interface Props {
  setOpenModalDetail: (value: boolean) => void
  setOpenModalPermission: (value: boolean) => void
  setOpenModalAdd: (value: boolean) => void
  setModeAction: (value: ModeAction) => void
  setModalDialog: (value: boolean) => void
  handleGetMemberOfRole: (value: string) => void
  handleGetPermissionAvailable: (value: string) => void
  handleGetPermissionAssigned: (value: string) => void
  setIdRole: (value: string) => void
  setSelectRoleItem: (value: PermissionItem) => void
  currentUserRoles?: string[]
}

export const PermissionManagementColumn = ({
  setOpenModalDetail,
  setModeAction,
  setModalDialog,
  handleGetMemberOfRole,
  handleGetPermissionAvailable,
  setOpenModalPermission,
  handleGetPermissionAssigned,
  setIdRole,
  setSelectRoleItem,
  currentUserRoles = []
}: Props): ColumnType<DataRoleItem>[] => [
    {
      title: '#',
      dataIndex: 'no',
      align: 'center'
    },
    {
      title: 'Tên nhóm quyền',
      dataIndex: 'name',
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'Ngày khởi tạo',
      dataIndex: 'date',
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      align: 'center',
      width: 100,
      // fixed: 'right',
      render: (_, record) => {
        // So sánh role name trong bảng với roles của user hiện tại từ JWT
        const isCurrentUserRole = currentUserRoles.includes(record.name)

        return (
          <div className='flex justify-start items-start gap-1'>
            <PermissionWrapper permission={Permission.FEE_FULL}>
                <ButtonComponent
                  type='default'
                  icon={<EditOutlined />}
                  onClick={() => {
                    setModeAction('edit')
                    setOpenModalPermission(true)
                    handleGetPermissionAssigned(record.id)
                  }}
                />

              <ButtonComponent
                type='default'
                className='text-blue-600'
                icon={<EyeOutlined />}
                onClick={() => {
                  setModeAction('view')
                  setOpenModalPermission(true)
                  handleGetPermissionAssigned(record.id)
                }}
              />
              <ButtonComponent
                type='default'
                className='text-yellow-600'
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
                className='text-red-600'
                icon={<DeleteOutlined />}
                onClick={() => {
                  setModeAction('delete')
                  setModalDialog(true)
                  setIdRole(record.id)
                  setSelectRoleItem(record)
                }}
              />
              <ButtonComponent
                type='default'
                className='text-violet-600'
                icon={<ApartmentOutlined />}
                onClick={() => {
                  setModeAction('permission')
                  handleGetPermissionAvailable(record.id)
                  setOpenModalPermission(true)
                }}
              />
            </PermissionWrapper>
          </div>
        )
      }
    }
  ]
