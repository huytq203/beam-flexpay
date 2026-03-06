import usePagination from '@hooks/usePagination'
import { useGetUnifiedQuery } from '@services/apiJournal'
import { useState } from 'react'
import { WithdrawSearchValues } from '../components/WithdrawHistorySearch'

const useFetchDataWithdraw = () => {
    const { page, pageSize, setPage, setPageSize, sort, sortBy } = usePagination()
    const [searchParams, setSearchParams] = useState<Partial<WithdrawSearchValues>>({})

    const payload = {
        page,
        pageSize,
        sortBy: sort,
        sortDirection: sortBy,
        transactionType: 'CASH_OUT',
        ...Object.fromEntries(
            Object.entries(searchParams).filter(([, v]) => v !== '' && v !== undefined && v !== null)
        ),
    }

    const { data: dataWithdraw, isLoading: isLoadingWithdraw, isFetching } = useGetUnifiedQuery(payload)

    const dataSource = dataWithdraw?.content.map((item, index) => ({
        no: (page - 1) * pageSize + index + 1,
        ...item,
        key: item.id,
    }))

    const handleSearch = (values: Partial<WithdrawSearchValues>) => {
        setSearchParams(values)
        setPage(1)
    }

    return {
        dataWithdraw,
        isLoadingWithdraw,
        setPage,
        setPageSize,
        sort,
        sortBy,
        dataSource,
        handleSearch,
        isFetching
    }
}

export default useFetchDataWithdraw