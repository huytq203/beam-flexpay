import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
  LockOutlined,
  UserSwitchOutlined
} from '@components/icons/common'
import { ButtonComponent, TooltipComponent } from '@components/common'
import { UserInfor } from '@type/userManagement'
import { ColumnType } from 'antd/lib/table'
import { ActionMode } from '../UserManagement'

interface Props {
  setOpenModalDetail: (record: boolean) => void
  setOpenDialog: (record: boolean) => void
  setModeAction: (value: ActionMode) => void
  handleOpenDetail: (record: UserInfor) => void
  handleOpenUpdate: (record: UserInfor) => void
  setSelectedUser: (record: UserInfor) => void
  setOpenModalAdd: (value: boolean) => void
  setOpenModalRoleAssign: (value: boolean) => void
  handleOpenRoleAssign: (record: UserInfor) => void
}

export const RoleManagemenColume = ({
  handleOpenUpdate,
  setModeAction,
  setOpenDialog,
  handleOpenDetail,
  setSelectedUser,
  handleOpenRoleAssign
}: Props): ColumnType<UserInfor>[] => [
    {
      title: '#',
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
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'lastName',
      dataIndex: 'lastName',
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'emailVerified',
      dataIndex: 'emailVerified',
      align: 'center',
      render: (value) => value || '--'
    },
    {
      title: 'Nhóm quyền',
      dataIndex: 'groups',
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'enabled',
      align: 'center',
      render(value, record, index) {
        return(
          <div className="">
            {record.enabled? <p className='text-green bg-green border border-green text-xs rounded-md inline-block px-2 font-medium'>Hoạt động</p>: <p className='text-red bg-red border border-red text-xs rounded-md inline-block px-2 font-medium'>Không hoạt động</p>}
          </div>
        )
      },
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
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className='flex justify-center items-center gap-1'>
          <TooltipComponent title='Chỉnh sửa'>
            <ButtonComponent
              size='small'
              type='default'
              icon={<EditOutlined />}
              onClick={() => handleOpenUpdate(record)}
            />
          </TooltipComponent>
          <TooltipComponent title='Xem chi tiết'>
          <ButtonComponent
            size='small'
            type='default'
            className='text-blue-600'
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record)}
          />

          </TooltipComponent>
          {/* <TooltipComponent title='Khóa tài khoản'>
          <ButtonComponent
            size='small'
            type='default'
            className='text-yellow-600'
            icon={<LockOutlined />}
            onClick={() => {
              setModeAction('lock')
              setOpenDialog(true)
              setSelectedUser(record)
            }}
          />

          </TooltipComponent>
          <TooltipComponent title='Xóa tài khoản'>
          <ButtonComponent
            size='small'
            type='default'
            className='text-red-600'
            icon={<DeleteOutlined />}
            onClick={() => {
              setModeAction('delete')
              setOpenDialog(true)
              setSelectedUser(record)
            }}
          />

          </TooltipComponent> */}
          {/* <ButtonComponent
            size='small'
            type='default'
            className='text-violet-600'
            icon={<KeyOutlined />}
            onClick={() => {
              setModeAction('resetPass')
              setOpenDialog(true)
              setSelectedUser(record)
            }}
          /> */}
          <TooltipComponent title='Gán nhóm quyền'>
            <ButtonComponent
              size='small'
              type='default'
              className='text-violet-600'
              icon={<ApartmentOutlined />}
              onClick={() => handleOpenRoleAssign(record)}
            />
          </TooltipComponent>
        </div>
      )
    }
  ]
