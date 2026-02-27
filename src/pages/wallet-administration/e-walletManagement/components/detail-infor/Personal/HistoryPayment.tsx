import { CardComponent, Table } from '@components/index'
import React from 'react'
import { Column } from './configs/HistoryPayment.column'
import HistoryFormSearch from './components/HistoryFormSearch'
import useFetchData from './hooks/useFetchData'

const HistoryPayment = ({ownerId}: {ownerId: string}) => {
  const {dataTransaction,isLoadingGetTransaction}=useFetchData(ownerId)
  


  const column = Column()
  return (
    <div>

      <CardComponent className='mt-3' content={<><HistoryFormSearch /></>} />
      <CardComponent className='mt-3' content={<Table scroll={{ x: 'max-content' }} size='small' bordered columns={column} />} />

    </div>
  )
}

export default HistoryPayment