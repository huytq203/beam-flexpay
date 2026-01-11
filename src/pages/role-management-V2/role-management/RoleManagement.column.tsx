import { DeleteOutlined, EditOutlined, LockOutlined } from '@components/icons/common'
import { ButtonComponent } from '@components/common'
import { ColumnType } from 'antd/lib/table'
import { RoleDataItem } from '@type/roleManagementV2'
import { ModeAction } from './hooks/useRoleManagement'
import { PermissionItem } from '@type/permissionManagement'

interface Props {
  setModeAction: (value: ModeAction) => void
  setOpenModalAdd: (value: boolean) => void
  setOpenDialog: (value: boolean) => void
  setSelectedPermission: (value: PermissionItem) => void
}

export const RoleManagementColumn = ({
  setModeAction,
  setOpenModalAdd,
  setSelectedPermission,
  setOpenDialog
}: Props): ColumnType<RoleDataItem>[] => [
    {
      title: '#',
      dataIndex: 'no',
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      align: 'center',
      render: (value) => value ?? '--'
    },
    {
      title: 'Mã quyền',
      dataIndex: 'ma',
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
      title: 'Trạng thái',
      dataIndex: 'description',
      align: 'center',
      render: (value) => value || '--'
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className='flex justify-center items-center gap-1'>
          <ButtonComponent
          size='small'
            type='default'
            icon={<EditOutlined />}
            onClick={() => {
              setModeAction('update')
              setOpenModalAdd(true)
              setSelectedPermission(record)
            }}
          />
          <ButtonComponent
          size='small'
            type='default'
            className='text-yellow-600'
            icon={<LockOutlined />}
          />
          <ButtonComponent
          size='small'
            type='default'
            className='text-red-600'
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
  ]
