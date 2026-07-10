import { apiWalletCore } from "@services/apiService";
import { ResponseType } from "@type/api";
import { PageResult, TransactionItem} from "@type/transaction.type";

const apiTransacjtionV2 = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getTransaction: build.query({
            query: (params) => ({
                url: `/wallet/transactions`,
                params: params,
                method: 'GET'
            }),
            providesTags: ['historyTransaction'],
            transformResponse: (res: ResponseType<PageResult<TransactionItem>>) => res.data
        })
    })
})
export const {
    useGetTransactionQuery
} = apiTransacjtionV2