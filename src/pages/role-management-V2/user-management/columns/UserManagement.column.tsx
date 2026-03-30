import {
  ApartmentOutlined,
  EditOutlined,
  EyeOutlined
} from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { UserInfor } from '@type/userManagement'
import { ColumnType } from 'antd/lib/table'
import { ModalType, SelectedUser } from '../types/UserManagement.type'

interface Props {
  openModal: (type: ModalType, user?: SelectedUser | null) => void
}

export const UserManagementColumn = ({
  openModal
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
      align: 'left',
      render: (value, record) => `${record.firstName} ${record.lastName ?? ''}`
    },
    {
      title: 'Email',
      dataIndex: 'email',
      align: 'left',
      render: (value) => value ?? '--'
    },
    {
      title: 'Xác thực email',
      dataIndex: 'emailVerified',
      align: 'center',
      render(_, record) {
        return (
          <div>
            {record.emailVerified ? (
              <p className='text-green bg-green border border-green text-xs rounded-md inline-block px-2 font-medium'>
                Đã xác thực
              </p>
            ) : (
              <p className='text-red bg-red border border-red text-xs rounded-md inline-block px-2 font-medium'>
                Chưa xác thực
              </p>
            )}
          </div>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'enabled',
      align: 'center',
      render(_, record) {
        return (
          <div>
            {record.enabled ? (
              <p className='text-green bg-green border border-green text-xs rounded-md inline-block px-2 font-medium'>
                Hoạt động
              </p>
            ) : (
              <p className='text-red bg-red border border-red text-xs rounded-md inline-block px-2 font-medium'>
                Không hoạt động
              </p>
            )}
          </div>
        )
      }
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
              onClick={() => openModal('edit', record)}
              hidden
            />
          </TooltipComponent>
          <TooltipComponent title='Xem chi tiết'>
            <ButtonComponent
              size='small'
              type='default'
              className='text-blue-600'
              icon={<EyeOutlined />}
              onClick={() => openModal('viewDetail', record)}
            />
          </TooltipComponent>
          <TooltipComponent title='Gán nhóm quyền'>
            <ButtonComponent
              size='small'
              type='default'
              className='text-violet-600'
              icon={<ApartmentOutlined />}
              onClick={() => openModal('assignRoles', record)}
            />
          </TooltipComponent>
        </div>
      )
    }
  ]
