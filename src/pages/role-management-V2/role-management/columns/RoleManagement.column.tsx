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
import { RoleName } from '../constants/RoleManagement.constant'
import { ModalType, SelectedRole } from '../types/RoleManagement.type'
import { Can } from '@/app/permissions'

interface Props {
  openModal: (type: ModalType, role: SelectedRole | null) => void
  currentUserRoles?: string[]
}

export const getRoleManagementColumn = ({
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
          <Can screen='ROLE_MANAGEMENT' action='edit'>
            <TooltipComponent title='Cập nhật'>
              <ButtonComponent
                aria-label='Sửa nhóm quyền'
                size='small'
                type='default'
                icon={<EditOutlined />}
                onClick={() => openModal('edit', record)}
              />
            </TooltipComponent>
          </Can>
          <Can screen='ROLE_MANAGEMENT' action='viewPermissions'>
            <TooltipComponent title='Xem các quyền'>
              <ButtonComponent
                aria-label='Xem quyền của nhóm'
                size='small'
                type='default'
                className='text-blue-600'
                icon={<EyeOutlined />}
                onClick={() => openModal('viewPermissions', record)}
              />
            </TooltipComponent>
          </Can>
          <Can screen='ROLE_MANAGEMENT' action='viewMembers'>
            <TooltipComponent title='Xem người dùng'>
              <ButtonComponent
                aria-label='Xem thành viên'
                size='small'
                type='default'
                className='text-green-600'
                icon={<UserOutlined />}
                onClick={() => openModal('viewMembers', record)}
              />
            </TooltipComponent>
          </Can>
          <Can screen='ROLE_MANAGEMENT' action='delete'>
            <TooltipComponent title='Xóa'>
              <ButtonComponent
                aria-label='Xoá nhóm quyền'
                size='small'
                type='default'
                className='text-red-600'
                icon={<DeleteOutlined />}
                onClick={() => openModal('delete', record)}
              />
            </TooltipComponent>
          </Can>
          <Can screen='ROLE_MANAGEMENT' action='assignPermissions'>
            <TooltipComponent title='Phân quyền'>
              <ButtonComponent
                aria-label='Gán quyền'
                size='small'
                type='default'
                className='text-violet-600'
                icon={<ApartmentOutlined />}
                onClick={() => openModal('assignPermissions', record)}
              />
            </TooltipComponent>
          </Can>
        </div>
      )
    }
  }
]
