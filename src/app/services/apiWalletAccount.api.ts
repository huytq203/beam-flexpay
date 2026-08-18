import { apiWalletCore } from "@services/apiService"
import { ResponseType } from "@type/api"
import { ContentAccountWallet, DataAccountWallet } from "@type/responseAccountWallet"

export interface FreezeTransactionRequest {
    accountId: string
    sourceTransactionId: string
    amount: number
    reason: string
}

export interface UnfreezeTransactionRequest {
    accountId: string
    freezeId: string
    sourceTransactionId: string
    amount: number
    reason: string
}

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
        postFreezeTransaction: build.mutation<unknown, FreezeTransactionRequest>({
            query: (body) => ({
                url: '/wallet/accounts/freeze-transaction',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet', 'Journal'],
        }),
        postUnfreezeTransaction: build.mutation<unknown, UnfreezeTransactionRequest>({
            query: (body) => ({
                url: '/wallet/accounts/unfreeze-transaction',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet', 'Journal'],
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
    useLazyGetAccountQuery,
    useGetAccountByIdQuery,
    useLazyGetAccountByIdQuery,
    usePostUnfreezeMutation,
    usePostFreezeMutation,
    usePostFreezeTransactionMutation,
    usePostUnfreezeTransactionMutation,
    usePostUnlockMutation,
    usePostLockMutation
} = apiEWallet
