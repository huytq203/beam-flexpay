import usePagination from '@hooks/usePagination'
import { useGetMerchantQuery } from '@services/apiMerchant'
import { useState } from 'react'
import type { MerchantFilters } from '../components/FormSearch'

const useFetchData = () => {
    const { page, pageSize:size, sort:sortBy ,sortBy:sortDirection, setPage, setPageSize } = usePagination()
    const [filters, setFilters] = useState<MerchantFilters>({})

    const payload={
        page,
        size,
        sortDirection,
        sortBy,
        ...filters
    }
    const {
        data: getMerchantData,
        isLoading: getMerchantLoading,
        isFetching,
        refetch
    } = useGetMerchantQuery(payload)

    const data = getMerchantData?.content?.map((item, index) => ({
        ...item,
        key: item.id,
        stt:(page - 1) * size + index + 1
    }))
    return {
        data,
        totalElements: getMerchantData?.totalElements ?? 0,
        page,
        size,
        payload,
        setPage,
        setPageSize,
        setFilters: (next: MerchantFilters) => { setPage(1); setFilters(next) },
        getMerchantLoading,
        isFetching,
        refetch
    }
}

export default useFetchData
