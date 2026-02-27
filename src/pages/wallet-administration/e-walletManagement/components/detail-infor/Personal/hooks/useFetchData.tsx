import usePagination from '@hooks/usePagination'
import { useGetTransactionQuery } from '@services/apiTransactionV2'
import React from 'react'

const useFetchData = (ownerId:string) => {

    const {params,page,size,setPage,setPageSize}=usePagination()
    const payload = {
        ownerId:ownerId,
        ...params
    }
    const { data: dataTransaction, isLoading: isLoadingGetTransaction } = useGetTransactionQuery(payload,{
        skip:!ownerId 
    })
    console.log(dataTransaction)
    return {
        dataTransaction,
        isLoadingGetTransaction
    }
}

export default useFetchData