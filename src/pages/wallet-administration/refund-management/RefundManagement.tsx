import { CardComponent, Table } from '@components/common'
import FormSearch from '@pages/wallet-administration/refund-management/components/FormSearch'
import Column from '@pages/wallet-administration/refund-management/configs/Refund.column'
import React from 'react'

const RefundManagement = () => {
  const column = Column()
  return (
    <>
      <div className=' flex flex-col gap-3'>
        <CardComponent content={<FormSearch />} />
        <CardComponent
          content={
            <Table
              size='small'
              columns={column}
              bordered
              scroll={{ x: 'max-content' }}
            />
          }
        />
      </div>
    </>
  )
}

export default RefundManagement
