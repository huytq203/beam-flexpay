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
      title: 'STT',
      dataIndex: 'no',
      align: 'center'
    },
    {
      title: 'Ten dang nhap',
      dataIndex: 'username',
      align: 'center'
    },
    {
      title: 'Ho va ten',
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
      title: 'Xac thuc email',
      dataIndex: 'emailVerified',
      align: 'center',
      render(_, record) {
        return (
          <div>
            {record.emailVerified ? (
              <p className='text-green bg-green border border-green text-xs rounded-md inline-block px-2 font-medium'>
                Da xac thuc
              </p>
            ) : (
              <p className='text-red bg-red border border-red text-xs rounded-md inline-block px-2 font-medium'>
                Chua xac thuc
              </p>
            )}
          </div>
        )
      }
    },
    {
      title: 'Trang thai',
      dataIndex: 'enabled',
      align: 'center',
      render(_, record) {
        return (
          <div>
            {record.enabled ? (
              <p className='text-green bg-green border border-green text-xs rounded-md inline-block px-2 font-medium'>
                Hoat dong
              </p>
            ) : (
              <p className='text-red bg-red border border-red text-xs rounded-md inline-block px-2 font-medium'>
                Khong hoat dong
              </p>
            )}
          </div>
        )
      }
    },
    {
      title: 'Ngay tao',
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
      title: 'Thao tac',
      dataIndex: 'action',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className='flex justify-center items-center gap-1'>
          <TooltipComponent title='Chinh sua'>
            <ButtonComponent
              size='small'
              type='default'
              icon={<EditOutlined />}
              onClick={() => openModal('edit', record)}
              hidden
            />
          </TooltipComponent>
          <TooltipComponent title='Xem chi tiet'>
            <ButtonComponent
              size='small'
              type='default'
              className='text-blue-600'
              icon={<EyeOutlined />}
              onClick={() => openModal('viewDetail', record)}
            />
          </TooltipComponent>
          <TooltipComponent title='Gan nhom quyen'>
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
