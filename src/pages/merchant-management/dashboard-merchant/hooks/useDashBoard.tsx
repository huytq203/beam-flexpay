import { useGetMerchantQuery } from '@services/apiMerchant'
import { useGetMerchantOrderQuery } from '@services/apiOrderMerchant.api'
import usePagination from '@hooks/usePagination'
import { DashBoarColumn } from '../columns/DashBoard.column'
import { useMemo } from 'react'
import { MerchanOrderItem } from '@pages/merchant-management/merchant-order/types/apiOrder.type'

const useDashBoard = () => {
    const { page } = usePagination()

    const { data: dataMerchant, isLoading: loadingMerchant } = useGetMerchantQuery({
        page,
        size: 1000
    })

    const { data: dataMerchantOrder, isLoading: loadingOrder } = useGetMerchantOrderQuery({
        page,
        size: 1000,
    })

    const totalOrderSuccess = useMemo(() =>
        dataMerchantOrder?.data?.content?.filter(
            (item: MerchanOrderItem) => item.status === 'SUCCESS'
        ).length ?? 0
    , [dataMerchantOrder])

    const totalOrderPending = useMemo(() =>
        dataMerchantOrder?.data?.content?.filter(
            (item: MerchanOrderItem) => item.status === 'ACTIVE'
        ).length ?? 0
    , [dataMerchantOrder])

    const totalAmount = useMemo(() =>
        dataMerchantOrder?.data?.content?.reduce(
            (sum: number, item: MerchanOrderItem) => sum + (item.amount || 0), 0
        ) ?? 0
    , [dataMerchantOrder])

    const recentOrders = useMemo(() =>
        dataMerchantOrder?.data?.content?.slice(0, 10) ?? []
    , [dataMerchantOrder])

    const columns = DashBoarColumn()

    return {
        dataMerchant,
        dataMerchantOrder,
        totalOrderSuccess,
        totalOrderPending,
        totalAmount,
        recentOrders,
        columns,
        loadingMerchant,
        loadingOrder
    }
}

export default useDashBoard
