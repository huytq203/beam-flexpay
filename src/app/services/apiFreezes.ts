import { apiWalletCore } from '@services/apiService'
import { FreezeItem, FreezeParams } from '@type/freezeAccount'

interface SpringPage<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
}

interface FreezeResponse {
    data: SpringPage<FreezeItem>
    message: string
    success: boolean
    status: string
}

export const apiFreezes = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getFreezes: build.query<SpringPage<FreezeItem>, FreezeParams>({
            query: (params) => ({
                url: '/wallet/freezes',
                params,
                method: 'GET',
            }),
            transformResponse: (res: FreezeResponse) => res.data,
            providesTags: ['Wallet'],
        }),
    }),
})

export const { useGetFreezesQuery, useLazyGetFreezesQuery } = apiFreezes