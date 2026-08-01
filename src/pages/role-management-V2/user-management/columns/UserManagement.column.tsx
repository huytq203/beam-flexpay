import {
  ApartmentOutlined,
  CheckCircleFilled,
  EditOutlined,
  EyeOutlined,
  MinusCircleIcon
} from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { UserInfor } from '@type/userManagement'
import { ColumnType } from 'antd/es/table'
import { ModalType, SelectedUser } from '../types/UserManagement.type'

interface Props {
  openModal: (type: ModalType, user?: SelectedUser | null) => void
}

export const getUserManagementColumn = ({
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
      align: 'center',
      render: (_, record) => record.username || '--'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'firstName',
      align: 'left',
      render: (value, record) => {
        const fullName = `${record.lastName || ''} ${record.firstName || ''}`.trim()
        return fullName || '--'
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      align: 'left',
      render: (value, record) => (
        <div className='flex flex-wrap items-center gap-1.5'>
          <span>{value || '--'}</span>
          {value &&(
             record.emailVerified ? (
            <span className='success-status inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] leading-4'>
              <CheckCircleFilled aria-hidden />
              Xác thực
            </span>
          ) : (
            <span className='warning-status inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] leading-4'>
              <MinusCircleIcon
                aria-hidden
                size={13}
                weight='fill'
              />
              Chưa xác thực
            </span>
          )
          )}
        </div>
      )
    },
    // {
    //   title: 'Xác thực email',
    //   dataIndex: 'emailVerified',
    //   align: 'center',
    //   render(_, record) {
    //     return (
    //       <div className='text-center'>
    //         {record.emailVerified ? (
    //           <p className='success-status rounded-md inline-flex text-[11px] px-2'>
    //             Đã xác thực
    //           </p>
    //         ) : (
    //           <p className='danger-status rounded-md inline-flex text-[11px] px-2'>
    //             Chưa xác thực
    //           </p>
    //         )}
    //       </div>
    //     )
    //   }
    // },
    {
      title: 'Trạng thái',
      dataIndex: 'enabled',
      align: 'center',
      render(_, record) {
        return (
          <div>
            {record.enabled ? (
              <p className='success-status rounded-md inline-flex text-[11px] px-2'>
                Hoạt động
              </p>
            ) : (
              <p className='danger-status rounded-md inline-flex text-[11px] px-2'>
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
