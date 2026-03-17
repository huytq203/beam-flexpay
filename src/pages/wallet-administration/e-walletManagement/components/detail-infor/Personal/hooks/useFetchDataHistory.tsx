import usePagination from '@hooks/usePagination'
import { useGetUnifiedQuery } from '@services/apiJournal'
import { useGetTransactionQuery } from '@services/apiTransactionV2'
import React from 'react'

interface SearchParams {
    status?: string
    type?: string
    fromDate?: string
    toDate?: string
    initiatorUsername?: string
}

interface Props {
    ownerId: string
    initiatorUsername: string
    searchParams?: SearchParams
}
const useFetchData = ({ ownerId, initiatorUsername, searchParams }: Props) => {
    const {  page, size, setPage, setPageSize } = usePagination()

    const payload = React.useMemo(() => ({
        ownerId: ownerId,
        page:page,
        size:size,
        ...searchParams,
    }), [ownerId, page, size, searchParams])
    const payload2 = React.useMemo(() => ({
        initiatorUsername: initiatorUsername,
        page:page,
        size:size,
        ...searchParams,
    }), [initiatorUsername, page, size, searchParams])

    const { data: dataTransaction, isLoading: isLoadingGetTransaction } = useGetTransactionQuery(payload, {
        skip: !ownerId
    })

    const {data:dataUnified,isLoading:isLoadingGetUnified}=useGetUnifiedQuery(payload2)
    const dataSource = React.useMemo(() => {
        return dataTransaction?.content?.map((item, index) => ({
            no: (page - 1) * size + index + 1,
            ...item,
            key: item.id,
        }))
    }, [dataTransaction])

    const dataSourceUnified = React.useMemo(() => {
        return dataUnified?.content?.map((item, index) => ({
            no: (page - 1) * size + index + 1,
            ...item,
            key: item.id,
        }))
    }, [dataUnified])
    console.log(dataSourceUnified)
    return {
        dataTransaction,
        isLoadingGetTransaction,
        dataSourceUnified,
        dataSource,
        page,
        size,
        setPage,
        setPageSize
    }
}

export default useFetchData