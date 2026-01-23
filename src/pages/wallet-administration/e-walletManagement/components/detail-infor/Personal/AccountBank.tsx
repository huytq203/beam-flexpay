import { ButtonComponent, CardComponent, Table } from '@components/index'
import React from 'react'
import { Column } from './configs/AccountBank.column'

const AccountBank = () => {
  const column = Column()
  return (
    <div>

      <CardComponent className='mt-3' content={<>
        <div className="flex justify-between items-center mb-3">
          <span className='font-medium text-gray-600 text-lg'>Danh sách liên kết</span>
          <ButtonComponent content='Xuất Excel' />
        </div>
        <Table  scroll={{ x: 'max-content' }}  size='small' columns={column} bordered />
      </>} />
    </div>
  )
}

export default AccountBank
