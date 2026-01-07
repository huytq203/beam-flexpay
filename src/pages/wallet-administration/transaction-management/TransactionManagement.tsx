import { CardComponent, Table } from '@components/common'
import React from 'react'
import FormSearch from './components/FormSearch'
import { Column } from './config/Transaction.column'

const TransactionManagement = () => {
  const columns=Column()
  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={<FormSearch/>}  />
      <CardComponent  content={<Table bordered size='small' scroll={{ x: 'max-content' }} columns={columns}  />}  />
    </div>
  )
}

export default TransactionManagement