import { CardComponent, Table } from '@components/common'
import React from 'react'
import HistoryFormSearch from './components/HistoryFormSearch'
import { Column } from './configs/HistoryPayment.column'

const HistoryPayment = () => {
  const column=Column()
  return (
    <div>

      <CardComponent className='mt-3' content={<><HistoryFormSearch/></>}/>
      <CardComponent className='mt-3' content={<Table  scroll={{ x: 'max-content' }}   size='small' bordered columns={column}/>}/>

    </div>
  )
}

export default HistoryPayment