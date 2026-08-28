import usePagination from '@hooks/usePagination'
import { useGetUnifiedQuery } from '@services/apiJournal'
import React from 'react'

interface SearchParams {
    [key: string]: string | number | undefined
    transactionCode?: string
    counterpartyUsername?: string
    sourceDomain?: string
    status?: string
    transactionType?: string
    paymentMethod?: string
    fromDate?: string
    toDate?: string
}

interface Props {
    partyId: string
    searchParams?: SearchParams
}
const useFetchData = ({ partyId, searchParams }: Props) => {
    const {  page, size, setPage, setPageSize } = usePagination()


    const payload2 = React.useMemo(() => ({
        partyId,
        page:page,
        size:size,
        ...searchParams,
    }), [partyId, page, size, searchParams])


    const {data:dataUnified,isLoading:isLoadingGetUnified}=useGetUnifiedQuery(payload2)

    const dataSourceUnified = React.useMemo(() => {
        return dataUnified?.content?.map((item, index) => ({
            no: (page - 1) * size + index + 1,
            ...item,
            key: item.id,
        }))
    }, [dataUnified, page, size])
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
