import { ButtonComponent, TooltipComponent } from '@components/index'
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined
} from '@components/icons'
import { ColumnType } from 'antd/es/table'
import { DataRoleItem } from '@type/roleManagement'
import { RoleName } from '../constants/PermissionManagement.constant'
import { ModalType, SelectedRole } from '../types/PermissionManagement.type'

interface Props {
  openModal: (type: ModalType, role: SelectedRole | null) => void
  currentUserRoles?: string[]
}

export const getPermissionManagementColumn = ({
  openModal
}: Props): ColumnType<DataRoleItem>[] => [
    {
      title: '#',
      dataIndex: 'no',
      width: 50,
      align: 'center'
    },
    {
      title: 'Tên nhóm quyền',
      dataIndex: 'name',
      align: 'left',
      render: (text: string) => (
        <TooltipComponent title={RoleName[text] ?? text}>
          <span className='inline-block max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap '>
            {RoleName[text] ?? text ?? '--'}
          </span>
        </TooltipComponent>
      )
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      align: 'center',
      width: 50,
      render: (_, record) => {
        return (
          <div className='flex justify-start items-start gap-1'>
            <TooltipComponent title='Cập nhật'>
              <ButtonComponent
                size='small'
                type='default'
                icon={<EditOutlined />}
                onClick={() => openModal('edit', record)}
              />
            </TooltipComponent>
            <TooltipComponent title='Xem các quyền'>
              <ButtonComponent
                size='small'
                type='default'
                className='text-blue-600'
                icon={<EyeOutlined />}
                onClick={() => openModal('viewPermissions', record)}
              />
            </TooltipComponent>
            <TooltipComponent title='Xem người dùng'>
              <ButtonComponent
                size='small'
                type='default'
                className='text-green-600'
                icon={<UserOutlined />}
                onClick={() => openModal('viewMembers', record)}
              />
            </TooltipComponent>
            <TooltipComponent title='Xóa'>
              <ButtonComponent
                size='small'
                type='default'
                className='text-red-600'
                icon={<DeleteOutlined />}
                onClick={() => openModal('delete', record)}
              />
            </TooltipComponent>
            <TooltipComponent title='Phân quyền'>
              <ButtonComponent
                size='small'
                type='default'
                className='text-violet-600'
                icon={<ApartmentOutlined />}
                onClick={() => openModal('assignPermissions', record)}
              />
            </TooltipComponent>
          </div>
        )
      }
    }
  ]
