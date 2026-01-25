import { apiWalletCore } from "@services/apiService"
import { ResponseType } from "@type/api"

export const apiEWallet = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getAccount: build.query({
            query: (params) => ({
                url: `/wallet/accounts`,
                params: params,
                method: 'GET'
            }),
            providesTags: ['Wallet'],
        }),
        getAccountById: build.query({
            query: (id) => ({
                url: `/wallet/accounts/${id}`,
                method: 'GET'
            }),
            providesTags: ['Wallet'],
        })
    })
})
export const {
    useGetAccountQuery,
    useGetAccountByIdQuery
} = apiEWallet