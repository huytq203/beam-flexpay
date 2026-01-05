import { CardComponent, Table } from '@components/common'
import React from 'react'
import FormSearch from './components/FormSearch'
import useEwalletManagement from './hooks/useEwalletManagement'

const EwalletManagement = () => {
    const {column,dataSource}=useEwalletManagement()
  return (
    <div>

        <CardComponent className='mb-3' content={<FormSearch/>}/>


        <CardComponent content={
            <>
            <Table scroll={{ x: 'max-content' }} size='small' columns={column} bordered  dataSource={dataSource}/>
            </>
        } />
    </div>
  )
}

export default EwalletManagement