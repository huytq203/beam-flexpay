import { useSearchFeePoliciesQuery } from '@services/apiFeePoliciesServices'
import { useMemo } from 'react'

export interface FeePolicyFilters {
    keyword?: string
    serviceType?: string
    status?: string
    feeDomain?: string
}

interface UseFetchDataFeeArgs {
    filters: FeePolicyFilters
    page: number
    size: number
}

const useFetchDataFee = ({ filters, page, size }: UseFetchDataFeeArgs) => {
    const payload = useMemo(
        () => ({
            keyword: filters.keyword || '',
            serviceType: filters.serviceType || undefined,
            status: filters.status || undefined,
            feeDomain: filters.feeDomain || undefined,
            page,
            size,
            sortBy: 'createdAt',
            sortDirection: 'DESC'
        }),
        [filters, page, size]
    )

    const {
        data: dataFeeManagement,
        isLoading: isLoadingFeeManagement,
        isFetching: isFetchingFeeManagement,
        isError: isErrorFeeManagement,
        refetch
    } = useSearchFeePoliciesQuery(payload)

    const dataSource = useMemo(
        () =>
            dataFeeManagement?.content?.map((item, index) => ({
                no: (page - 1) * size + index + 1,
                ...item,
                key: item.id
            })),
        [dataFeeManagement, page, size]
    )

    return {
        dataFeeManagement,
        dataSource,
        isLoadingFeeManagement,
        isFetchingFeeManagement,
        isErrorFeeManagement,
        total: dataFeeManagement?.totalElements,
        refetch
    }
}

export default useFetchDataFee
