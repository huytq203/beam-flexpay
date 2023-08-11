import { ResponseType } from '@type/api'
import { apiService } from './apiService'

export const limitRegulationsApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListTransactionLimit: builder.query({
      query: (payload) => ({
        url: `/transaction-limit${payload.arr ? `?${payload.arr}` : ''}`,
        method: 'GET',
        params: {
          take: payload?.take,
          page: payload?.page,
          applicableObject: payload?.object || payload?.applicableObject,
          serviceType: payload?.serviceType,
          account: payload?.account
        }
      }),
      transformResponse: (res: ResponseType<any>) => res.data
    }),
    getDetailTransactionLimit: builder.query({
      query: (payload) => ({
        url: `/transaction-limit/${payload}`,
        method: 'GET'
      })
    }),
    createTransactionLimit: builder.mutation({
      query: (payload) => ({
        url: '/transaction-limit',
        method: 'POST',
        body: payload
      })
    }),
    updateTransactionLimit: builder.mutation({
      query: (payload) => ({
        url: `/transaction-limit/${payload.id}`,
        method: 'PATCH',
        body: payload
      })
    }),
    deleteTransactionLimit: builder.mutation({
      query: (payload) => ({
        url: `/transaction-limit/${payload}`,
        method: 'DELETE'
      })
    })
  })
})

export const {
  useCreateTransactionLimitMutation,
  useGetDetailTransactionLimitQuery,
  useGetListTransactionLimitQuery,
  useDeleteTransactionLimitMutation,
  useUpdateTransactionLimitMutation,
  useLazyGetDetailTransactionLimitQuery
} = limitRegulationsApi
