import { EditOutlined, LockOutlined } from '@components/icons/common'
import { ButtonComponent } from '@components/common'
import { ColumnType } from 'antd/lib/table'
import React from 'react'

export const RoleManagementColumn = (): ColumnType<any>[] => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Tên quyền',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Mã quyền ',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Ngày khởi tạo ',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Trạng thái ',
    dataIndex: 'no',
    align: 'center'
  },
   {
      title: 'Thao tác  ',
      dataIndex: 'action',
      align: 'center',
  
      width: 100,
      fixed: 'right',
      render(value, record, index) {
        return (
          <div className='flex justify-center items-center gap-1'>
            <ButtonComponent
              type='default'
              className=''
              icon={<EditOutlined />}
            />
          
            <ButtonComponent
              type='default'
              className='text-yellow-600 '
              icon={<LockOutlined />}
            />
          </div>
        )
      }
    }
]
