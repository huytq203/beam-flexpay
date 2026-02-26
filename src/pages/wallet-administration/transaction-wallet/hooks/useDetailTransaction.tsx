import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetTransactionByIdQuery } from '../services/apiTransactionV2'

const useDetailTransaction = () => {
    const { id } = useParams()
    const {data:getTransactionById} = useGetTransactionByIdQuery(id)
    return {
        id,
        getTransactionById
    }
}

export default useDetailTransaction