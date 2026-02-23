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
        }),
         postUnfreeze: build.mutation({
            query: (body) => ({
                url: '/wallet/accounts/unfreeze',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        postFreeze: build.mutation({
            query: (body) => ({
                url: '/wallet/accounts/freeze',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
    })
})
export const {
    useGetAccountQuery,
    useLazyGetAccountQuery,
    useGetAccountByIdQuery,
    usePostUnfreezeMutation,
    usePostFreezeMutation
} = apiEWallet