import { apiWalletCore } from "@services/apiService";
import { ResponseType } from "@type/api";
import { PageResult, TransactionItem } from "@type/transaction.type";

export const apiTransacjtionV2 = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getTransaction: build.query({
            query: (params) => ({
                url: `/wallet/transactions`,
                params: params,
                method: 'GET'
            }),
            providesTags: ['historyTransaction'],
            transformResponse: (res: ResponseType<PageResult>) => res.data
        }),
        getTransactionById: build.query({
            query: (id) => ({
                url: `/wallet/transactions/${id}`,
                method: 'GET'
            }),
            providesTags: ['historyTransaction'],
            transformResponse: (res: ResponseType<TransactionItem>) => res.data
        })
    })
})
export const {
    useGetTransactionQuery,
    useLazyGetTransactionQuery,
    useGetTransactionByIdQuery
} = apiTransacjtionV2