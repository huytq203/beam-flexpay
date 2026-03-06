import usePagination from '@hooks/usePagination'
import { useGetTransactionQuery } from '@services/apiTransactionV2'
import React from 'react'

interface SearchParams {
    status?: string
    type?: string
    fromDate?: string
    toDate?: string
}

const useFetchData = (ownerId: string, searchParams?: SearchParams) => {
    const {  page, size, setPage, setPageSize } = usePagination()

    const payload = React.useMemo(() => ({
        ownerId: ownerId,
        page:page,
        size:size,
        ...searchParams,
    }), [ownerId, page, size, searchParams])

    const { data: dataTransaction, isLoading: isLoadingGetTransaction } = useGetTransactionQuery(payload, {
        skip: !ownerId
    })
    const dataSource = React.useMemo(() => {
        return dataTransaction?.content?.map((item, index) => ({
            no: (page - 1) * size + index + 1,
            ...item,
            key: item.id,
        }))
    }, [dataTransaction])
    return {
        dataTransaction,
        isLoadingGetTransaction,
        dataSource,
        page,
        size,
        setPage,
        setPageSize
    }
}

export default useFetchData