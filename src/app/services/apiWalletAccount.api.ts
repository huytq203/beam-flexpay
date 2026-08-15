import { apiWalletCore } from "@services/apiService"
import { ResponseType } from "@type/api"
import { ContentAccountWallet, DataAccountWallet } from "@type/responseAccountWallet"

const apiEWallet = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getAccount: build.query({
            query: (params) => ({
                url: `/wallet/accounts`,
                params: params,
                method: 'GET'
            }),
            transformResponse: (res: ResponseType<DataAccountWallet>) => res.data,
            providesTags: ['Wallet'],
        }),
        getAccountById: build.query({
            query: (id) => ({
                url: `/wallet/accounts/${id}`,
                method: 'GET'
            }),
            transformResponse: (res: ResponseType<ContentAccountWallet>) => res.data,
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
        postUnlock: build.mutation({
            query: (body) => ({
                url: '/wallet/accounts/unlock',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        postLock: build.mutation({
            query: (body) => ({
                url: '/wallet/accounts/lock',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
    })
})
export const {
    useGetAccountQuery,
    useGetAccountByIdQuery,
    useLazyGetAccountByIdQuery,
    usePostUnfreezeMutation,
    usePostFreezeMutation,
    usePostUnlockMutation,
    usePostLockMutation
} = apiEWallet
