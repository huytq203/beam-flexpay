import { useGetTransactionByIdQuery } from '@pages/wallet-administration/service/apiTransactionV2'
import React from 'react'
import { useParams } from 'react-router-dom'

const useDetailTransaction = () => {
    const { id } = useParams()
    const {data:getTransactionById} = useGetTransactionByIdQuery(id)
    return {
        id,
        getTransactionById
    }
}

export default useDetailTransaction