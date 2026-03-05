import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetUnifiedByIdQuery } from '../../../../app/services/apiJournal'

const useDetailTransaction = () => {
    const { id } = useParams()
    const { data: getTransactionById } = useGetUnifiedByIdQuery(id)
    return {
        id,
        getTransactionById
    }
}

export default useDetailTransaction
