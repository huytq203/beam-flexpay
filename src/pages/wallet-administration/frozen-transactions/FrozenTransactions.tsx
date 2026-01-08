import { CardComponent, DialogModal, ModalComponent, Table } from '@components/common'
import React from 'react'
import FormSearch from './components/FormSearch'
import { Column } from './configs/FrozenTransactions.column'

const FrozenTransactions = () => {
    const column=Column()
    return (
        <>
            <CardComponent className='mb-3' content={<FormSearch />} />
            <CardComponent content={<Table columns={column} />} />
        </>
    )
}

export default FrozenTransactions