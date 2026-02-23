import { ResponseType } from '@type/api'
import { apiMerchant } from './apiService'
import { ContentMerchant, DataMerchant } from '@type/merchant'
export const merchantService = apiMerchant.injectEndpoints({
    endpoints: (builder) => ({
        getMerchant: builder.query({
            query: (payload) => ({
                url: '/merchants',
                method: 'GET',
                params: payload
            }),
            transformResponse: (res: ResponseType<DataMerchant>) => res.data
        }),
        postMerchant: builder.mutation({
            query: (payload) => ({
                url: '/merchants',
                method: 'POST',
                body: payload
            })
        }),
        putMerchant: builder.mutation({
            query: ({ id, payload }) => ({
                url: `/merchants/${id}`,
                method: 'PUT',
                body: payload
            })
        }),
        getMerchantById: builder.query({
            query: (id: string) => `/merchants/${id}`,
            transformResponse: (res: ResponseType<ContentMerchant>) => res.data
        })
    })
})

export const {
    useGetMerchantQuery,
    usePostMerchantMutation,
    usePutMerchantMutation,
    useGetMerchantByIdQuery
} = merchantService
