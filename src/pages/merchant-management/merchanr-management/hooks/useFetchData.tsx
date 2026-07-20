import usePagination from '@hooks/usePagination'
import { useGetMerchantQuery } from '@services/apiMerchant'

const useFetchData = () => {
    const { page, pageSize:size, sort:sortBy ,sortBy:sortDirection } = usePagination()

    const payload={
        page,
        size,
        sortDirection,
        sortBy
    }
    const { data: getMerchantData, isLoading: getMerchantLoading } = useGetMerchantQuery(payload)

    const data = getMerchantData?.content?.map((item, index) => ({
        ...item,
        key: item.id,
        stt:(page - 1) * size + index + 1
    }))
    return {
        data,
        getMerchantLoading
    }
}

export default useFetchData