import { DeleteOutlined, EditOutlined } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { ColumnType } from 'antd/es/table'
import { PermissionItem } from '@type/permissionManagement'
import { translatePermissionName } from '../constants/PermissionManagement.constant'
import {
  PermissionModalType,
  SelectedPermission
} from '../types/PermissionManagement.type'
import { Can } from '@/app/permissions'

interface Props {
  openModal: (
    type: PermissionModalType,
    permission: SelectedPermission | null
  ) => void
}

export const getPermissionManagementColumns = ({
  openModal
}: Props): ColumnType<PermissionItem>[] => [
  {
    title: '#',
    dataIndex: 'no',
    width: 56,
    align: 'center',
    render: (value: number | undefined) => value ?? '--'
  },
  {
    title: 'Tên quyền',
    dataIndex: 'name',
    align: 'left',
    render: (value: string) => translatePermissionName(value)
  },
  {
    title: 'Mã quyền',
    dataIndex: 'name',
    align: 'left',
    render: (value: string) => value || '--'
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    align: 'left',
    render: (value: string | null) => value || '--'
  },
  {
    title: 'Thao tác',
    key: 'action',
    align: 'center',
    width: 96,
    fixed: 'right',
    render: (_, record) => (
      <div className='flex items-center justify-center gap-1'>
        <Can screen='PERMISSION_MANAGEMENT' action='edit'>
          <TooltipComponent title='Cập nhật'>
            <ButtonComponent
              aria-label='Sửa quyền'
              size='small'
              type='default'
              icon={<EditOutlined />}
              onClick={() => openModal('edit', record)}
            />
          </TooltipComponent>
        </Can>
        <Can screen='PERMISSION_MANAGEMENT' action='delete'>
          <TooltipComponent title='Xóa'>
            <ButtonComponent
              aria-label='Xoá quyền'
              size='small'
              type='default'
              danger
              icon={<DeleteOutlined />}
              onClick={() => openModal('delete', record)}
            />
          </TooltipComponent>
        </Can>
      </div>
    )
  }
]
