import { ButtonComponent, CardComponent } from '@components/index'
import { Table } from 'antd'
import React from 'react'
import { Column } from './configs/FeeSetting.column'

const FeeSetting = () => {
    const column = Column()
    return (
        <div><CardComponent className='mt-3' content={<>
            <div className="flex justify-between items-center mb-3">
                <span className='font-medium text-gray-600 text-lg'>Danh sách quy tắc tính phí</span>
                <div className="flex gap-3">
                    <ButtonComponent type='default' content='Thêm cấu hình' />
                    <ButtonComponent content='Xuất Excel' />
                </div>
            </div>
            <Table scroll={{ x: 'max-content' }} size='small' columns={column} bordered />
        </>} /></div>
    )
}

export default FeeSetting
