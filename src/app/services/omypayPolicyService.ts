import { ResponseType } from '@type/api'
import { apiService } from './apiService'

export const omipayPolicyAPI = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListOmipayPolicy: builder.query({
      query: (payload) => ({
        url: `/system-fee-management/get-policy-transfer-with-bank-card${
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
    createOmipayPolicy: builder.mutation({
      query: (payload) => ({
        url: '/system-fee-management/create-policy-transfer-with-FLEXPAY',
        method: 'POST',
        body: payload
      })
    }),
    updateOmipayPolicy: builder.mutation({
      query: (payload) => ({
        url: `/system-fee-management/update-policy-transfer-with-FLEXPAY/${payload.id}`,
        method: 'PUT',
        body: payload
      })
    }),
    deletePolicy: builder.mutation({
      query: (payload) => ({
        url: `/system-fee-management/${payload.id}`,
        method: 'DELETE'
      })
    })
  })
})

export const {
  useGetListOmipayPolicyQuery,
  useCreateOmipayPolicyMutation,
  useUpdateOmipayPolicyMutation,
  useDeletePolicyMutation
} = omipayPolicyAPI
