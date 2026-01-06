import { CardComponent } from '@components/common'
import React from 'react'
import FormSearch from './components/FormSearch'

const TransactionManagement = () => {
  return (
    <div><CardComponent content={<FormSearch/>}  /></div>
  )
}

export default TransactionManagement