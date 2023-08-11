import { ResponseType } from '@type/api'
import { apiService } from './apiService'

export const accountGroup = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListTransferPolicy: builder.query({
      query: (payload) => ({
        url: `/system-fee-management/get-policy-transfer-internal${
          payload.arr ? `?${payload.arr}` : ''
        }`,
        method: 'GET',
        params: {
          take: payload?.take,
          page: payload?.page,
          applicableObject: payload?.object || payload?.applicableObject
        }
      }),
      transformResponse: (res: ResponseType<any>) => res.data
    }),
    getDetailPolicy: builder.query({
      query: (payload) => ({
        url: `/system-fee-management/${payload}`,
        method: 'GET'
      })
    }),
    createTransferPolicy: builder.mutation({
      query: (payload) => ({
        url: '/system-fee-management/create-policy-transfer-internal',
        method: 'POST',
        body: payload
      })
    }),
    updateTransferPolicy: builder.mutation({
      query: (payload) => ({
        url: `/system-fee-management/update-policy-transfer-internal/${payload.id}`,
        method: 'PUT',
        body: payload
      })
    })
  })
})

export const {
  useGetListTransferPolicyQuery,
  useCreateTransferPolicyMutation,
  useUpdateTransferPolicyMutation,
  useLazyGetDetailPolicyQuery
} = accountGroup
