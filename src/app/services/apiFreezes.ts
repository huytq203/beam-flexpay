import { apiWalletCore } from '@services/apiService'
import { ResponseType } from '@type/api'
import { DataFreeze } from '@type/freeze.type'
import { FreezeItem, FreezeParams } from '@type/freezeAccount'



export const apiFreezes = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getFreezes: build.query({
            query: (params) => ({
                url: '/wallet/freezes',
                params: params,
                method: 'GET',
            }),
            transformResponse: (res: ResponseType<DataFreeze>) => res.data,
            providesTags: ['Wallet'],
        }),
        postUnfreeze: build.mutation({
            query: (body: { accountId: string; freezeId: string; reason: string }) => ({
                url: '/wallet/freezes/unfreeze',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: ['Wallet'],
        }),
    }),
})

export const { useGetFreezesQuery, useLazyGetFreezesQuery, usePostUnfreezeMutation } = apiFreezes