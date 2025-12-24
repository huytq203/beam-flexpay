import { ButtonComponent } from '@components/common'
import React from 'react'
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    KeyOutlined,
    LockOutlined,
    UserSwitchOutlined
} from '@components/icons/common'
import { ColumnType } from 'antd/lib/table'
export const RoleManagementColumn = (): ColumnType<any>[] =>
    [
        {
            title: 'STT',
            dataIndex: 'no',
            align: 'center',
            
        },
        {
            title: 'Tên nhóm quyền',
            dataIndex: 'name',
            align: 'center',
            
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            align: 'center',
            
        },
        {
            title: 'Ngày khởi tạo ',
            dataIndex: 'date',
            align: 'center',
            
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
                            className='text-blue-600 '
                            icon={<EyeOutlined />}
                        />
                        <ButtonComponent
                            type='default'
                            className='text-yellow-600 '
                            icon={<LockOutlined />}

                        />
                        {/* <ButtonComponent
                            type='default'
                            className='text-red-600 '
                            icon={<DeleteOutlined />}

                        />
                        */}
                    </div>
                )
            }
        }
    ]