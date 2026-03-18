import { DeleteOutlined, EditOutlined } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { ColumnType } from 'antd/lib/table'
import { RoleDataItem } from '@type/roleManagementV2'
import { translatePermissionName } from '../constants/RoleManagement.config'
import { ModalType, SelectedPermission } from '../types/RoleManagement.type'

interface Props {
  openModal: (type: ModalType, permission?: SelectedPermission | null) => void
}

export const getRoleManagementColumn = ({
  openModal
}: Props): ColumnType<RoleDataItem>[] => [
    {
      title: 'STT',
      dataIndex: 'no',
      align: 'center',
      render: (value) => value || '--'
    },
    // {
    //   title: 'Tên quyền',
    //   dataIndex: 'name',
    //   align: 'left',
    //   render: (value) => translatePermissionName(value)
    // },
    {
      title: 'Mã quyền',
      dataIndex: 'name',
      align: 'left',
      render: (value) => value || '--'
    },
    // {
    //   title: 'Ngày khởi tạo',
    //   dataIndex: 'date',
    //   align: 'center',
    //   render: (value) => value || '--'
    // },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      align: 'left',
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
            onClick={() => openModal('edit', record)}
          />
          <ButtonComponent
            size='small'
            type='default'
            className='text-red-600'
            icon={<DeleteOutlined />}
            onClick={() => openModal('delete', record)}
          />
        </div>
      )
    }
  ]
