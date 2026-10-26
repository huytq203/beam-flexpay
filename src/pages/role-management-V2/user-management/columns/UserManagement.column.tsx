import { StatusToneBadge } from '@components/status-badge/StatusToneBadge'
import {
  ApartmentOutlined,
  CheckCircleFilled,
  EditOutlined,
  EyeOutlined,
  MinusCircleIcon,
  KeyIcon
} from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { UserInfor } from '@type/userManagement'
import { ColumnType } from 'antd/es/table'
import { ModalType, SelectedUser } from '../types/UserManagement.type'
import { Can } from '@/app/permissions'
import { formatUserTimestamp } from '../utils/UserManagement.utils'

interface Props {
  openModal: (type: ModalType, user?: SelectedUser | null) => void
  currentUserId?: string
}

export const getUserManagementColumn = ({
  openModal,
  currentUserId
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
      const fullName =
        `${record.firstName || ''} ${record.lastName || ''}`.trim()
      return fullName || '--'
    }
  },
  {
    title: 'Email',
    dataIndex: 'email',
    align: 'left',
    render: (value, record) => (
      <div
        data-capy='no'
        className='flex flex-wrap items-center gap-1.5'
      >
        <span>{value || '--'}</span>
        {value &&
          (record.emailVerified ? (
            <StatusToneBadge
              tone='success'
              className='gap-1'
            >
              <CheckCircleFilled aria-hidden />
              Xác thực
            </StatusToneBadge>
          ) : (
            <StatusToneBadge
              tone='warning'
              className='gap-1'
            >
              <MinusCircleIcon
                aria-hidden
                size={13}
                weight='fill'
              />
              Chưa xác thực
            </StatusToneBadge>
          ))}
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
            <StatusToneBadge tone='success'>Hoạt động</StatusToneBadge>
          ) : (
            <StatusToneBadge tone='danger'>Không hoạt động</StatusToneBadge>
          )}
        </div>
      )
    }
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdTimestamp',
    align: 'left',
    render: (_, record) => (
      <div className='min-w-0 text-xs leading-5'>
        <p className='m-0 whitespace-nowrap text-slate-700'>
          {formatUserTimestamp(record.createdAt ?? record.createdTimestamp)}
        </p>
        <p
          className='m-0 max-w-48 truncate text-slate-500'
          title={record.createdBy ?? undefined}
        >
          {record.createdBy
            ? `Bởi ${record.createdBy}`
            : 'Không có dữ liệu người tạo'}
        </p>
      </div>
    )
  },
  {
    title: 'Cập nhật gần nhất',
    dataIndex: 'updatedAt',
    align: 'left',
    render: (_, record) => (
      <div className='min-w-0 text-xs leading-5'>
        <p className='m-0 whitespace-nowrap text-slate-700'>
          {formatUserTimestamp(record.updatedAt)}
        </p>
        <p
          className='m-0 max-w-48 truncate text-slate-500'
          title={record.updatedBy ?? undefined}
        >
          {record.updatedBy
            ? `Bởi ${record.updatedBy}`
            : 'Chưa có người cập nhật'}
        </p>
      </div>
    )
  },
  {
    title: 'Thao tác',
    dataIndex: 'action',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: (_, record) => (
      <div
        data-capy='no'
        className='flex justify-center items-center gap-1'
      >
        <Can
          screen='USER_ACCOUNT'
          action='viewDetail'
        >
          <TooltipComponent title='Xem chi tiết'>
            <ButtonComponent
              aria-label='Xem chi tiết'
              size='small'
              type='default'
              className='text-blue-600'
              icon={<EyeOutlined />}
              onClick={() => openModal('viewDetail', record)}
            />
          </TooltipComponent>
        </Can>
        <Can
          screen='USER_ACCOUNT'
          action='edit'
        >
          <TooltipComponent title='Sửa tài khoản'>
            <ButtonComponent
              aria-label='Sửa tài khoản'
              size='small'
              type='default'
              className='text-blue-600'
              icon={<EditOutlined />}
              onClick={() => openModal('edit', record)}
            />
          </TooltipComponent>
        </Can>
        <Can
          screen='USER_ACCOUNT'
          action='assignRoles'
        >
          <TooltipComponent title='Gán nhóm quyền'>
            <ButtonComponent
              aria-label='Gán nhóm quyền'
              size='small'
              type='default'
              className='text-violet-600'
              icon={<ApartmentOutlined />}
              onClick={() => openModal('assignRoles', record)}
            />
          </TooltipComponent>
        </Can>
        {record.id !== currentUserId && record.enabled && record.email && (
          <Can
            screen='USER_ACCOUNT'
            action='resetPassword'
          >
            <TooltipComponent title='Gửi liên kết đặt lại mật khẩu'>
              <ButtonComponent
                aria-label='Đặt lại mật khẩu'
                size='small'
                type='default'
                className='text-yellow-600'
                icon={<KeyIcon />}
                onClick={() => openModal('resetPassword', record)}
              />
            </TooltipComponent>
          </Can>
        )}
      </div>
    )
  }
]
