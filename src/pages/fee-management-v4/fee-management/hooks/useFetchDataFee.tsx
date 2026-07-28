import usePagination from '@hooks/usePagination'
import { useSearchFeePoliciesQuery } from '@services/apiFeePoliciesServices'
import { useMemo, useState } from 'react'
import { dataSearch } from '../types/FeeManagement.type'

const useFetchDataFee = () => {
    const { page, size, setPage, setPageSize, sort, sortBy } = usePagination()
    const [filters, setFilters] = useState<Partial<dataSearch>>({})
    const payload = {
        ...filters,
        keyword: filters.keyword || '',
        page,
        size,
        sortBy: sort,
        sortDirection: sortBy,
    }
    const {
        data: dataFeeManagement,
        isLoading: isLoadingFeeManagement,
        isFetching: isFetchingFeeManagement,
        refetch
    } = useSearchFeePoliciesQuery(payload)


    const dataSource = useMemo(() => dataFeeManagement?.content?.map((item, index) => {
        return {
            no: (page - 1) * size + index + 1,
            ...item,
            key: item.id,
        }
    }), [dataFeeManagement, page, size])
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
        refetch,
        isFetchingFeeManagement
    }
}

export default useFetchDataFee
