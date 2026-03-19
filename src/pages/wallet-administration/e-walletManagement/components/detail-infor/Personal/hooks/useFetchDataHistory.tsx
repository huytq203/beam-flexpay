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


    const payload2 = React.useMemo(() => ({
        initiatorUsername: initiatorUsername,
        page:page,
        size:size,
        ...searchParams,
    }), [initiatorUsername, page, size, searchParams])


    const {data:dataUnified,isLoading:isLoadingGetUnified}=useGetUnifiedQuery(payload2)

    const dataSourceUnified = React.useMemo(() => {
        return dataUnified?.content?.map((item, index) => ({
            no: (page - 1) * size + index + 1,
            ...item,
            key: item.id,
        }))
    }, [dataUnified])
    console.log(dataSourceUnified)
    return {
        isLoadingGetUnified,
        dataUnified,
        dataSourceUnified,
        page,
        size,
        setPage,
        setPageSize
    }
}

export default useFetchData