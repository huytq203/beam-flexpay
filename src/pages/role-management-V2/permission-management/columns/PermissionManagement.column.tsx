import { ButtonComponent, TooltipComponent } from '@components/common'
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
import { ModeAction } from '../hooks/usePermissionRole'
import { PermissionItem } from '@type/permissionManagement'
import { DataRoleItem } from '@type/roleManagement'
import { Permission } from '@constants/permissionConstant'
import { RoleName } from '../constants/PermissionManagement.constant'

interface Props {
  setOpenModalDetail: (value: boolean) => void
  setOpenModalPermission: (value: boolean) => void
  setOpenModalAdd: (value: boolean) => void
  setModeAction: (value: ModeAction) => void
  setModalDialog: (value: boolean) => void
  handleGetMemberOfRole: (value: string) => void
  handleGetPermissionAssigned: (value: string) => void
  setIdRole: (value: string) => void
  setSelectRoleItem: (value: PermissionItem) => void
  currentUserRoles?: string[]
  handleOpenPermissionModal: (value: string) => void
  setEditRoleData: (value: DataRoleItem | null) => void
}

export const PermissionManagementColumn = ({
  setOpenModalDetail,
  setModeAction,
  setModalDialog,
  setOpenModalAdd,
  handleGetMemberOfRole,
  setOpenModalPermission,
  handleGetPermissionAssigned,
  setIdRole,
  setSelectRoleItem,
  currentUserRoles = [],
  handleOpenPermissionModal,
  setEditRoleData
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
    render: (value) => RoleName[value] ?? value ?? '--'
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
          <TooltipComponent title='Cập nhật'>

          <ButtonComponent
            size='small'
            type='default'
            icon={<EditOutlined />}
            onClick={() => {
              setModeAction('edit')
              setEditRoleData(record)
              setOpenModalAdd(true)
            }}
          />
          </TooltipComponent>
          <TooltipComponent title='Xem các quyền'>


          <ButtonComponent
            size='small'
            type='default'
            className='text-blue-600'
            icon={<EyeOutlined />}
            onClick={() => {
              setModeAction('view')
              setOpenModalPermission(true)
              handleGetPermissionAssigned(record.id)
            }}
          />
          </TooltipComponent>
          {/* <ButtonComponent
            size='small'
            type='default'
            className='text-yellow-600'
            icon={<LockOutlined />}
            onClick={() => {
              setModeAction('lock')
              setModalDialog(true)
            }}
          /> */}

          <TooltipComponent title='Xem người dùng'>
          <ButtonComponent
            size='small'
            type='default'
            className='text-green-600'
            icon={<UserOutlined />}
            onClick={() => {
              setOpenModalDetail(true)
              handleGetMemberOfRole(record.id)
            }}
          />

          </TooltipComponent>

          <TooltipComponent title='Xóa'>
          <ButtonComponent
            size='small'
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

          </TooltipComponent>
          <TooltipComponent title='Phân quyền'>
          <ButtonComponent
            size='small'
            type='default'
            className='text-violet-600'
            icon={<ApartmentOutlined />}
            onClick={() => {
              setModeAction('permission')
              handleOpenPermissionModal(record.id)
              setOpenModalPermission(true)
            }}
          />

          </TooltipComponent>
        </div>
      )
    }
  }
]
