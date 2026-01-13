import { ButtonComponent, CardComponent, Table } from '@components/common'
import React from 'react'
import { Column } from './configs/FreezeBalance.column'

const FreezeBalance = () => {
    const column = Column()
    return (
        <div>
            <CardComponent className='mt-3' content={
                <>
                    <div className="flex justify-between items-center mb-3">
                        <span className='font-medium text-gray-600 text-lg'>Lịch sử đóng/mở băng</span>
                        <ButtonComponent content='Xuất Excel' />
                    </div>

                    <Table scroll={{ x: 'max-content' }} size='small' bordered columns={column} />
                </>} />
        </div>
    )
}

export default FreezeBalance