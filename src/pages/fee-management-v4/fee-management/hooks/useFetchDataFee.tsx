import usePagination from '@hooks/usePagination'
import { useSearchFeePoliciesQuery } from '@services/apiFeePoliciesServices'
import React, { useMemo, useState } from 'react'

const useFetchDataFee = () => {
    const { params, page, size, setPage, setPageSize, sort, sortBy } = usePagination()
    const [filters, setFilters] = useState<any>({})
    const payload = {
        ...filters,
        keyword: filters.keyword || '',
        page,
        size,
        sortBy: sort,
        sortDirection: sortBy,
    }
    const { data: dataFeeManagement, isLoading:isLoadingFeeManagement ,isFetching:isFetchingFeeManagement} = useSearchFeePoliciesQuery(payload)


    const dataSource = useMemo(() => dataFeeManagement?.content?.map((item, index) => {
        return {
            no: (page - 1) * size + index + 1,
            ...item,
            key: item.id,
        }
    }),[dataFeeManagement])
    const total = dataFeeManagement?.totalElements
    return {
        dataFeeManagement,
        dataSource,
        isLoadingFeeManagement,
        page,
        size,
        setPage,
        setPageSize,
        sort,
        sortBy,
        total,
        setFilters,
        isFetchingFeeManagement
    }
}

export default useFetchDataFee