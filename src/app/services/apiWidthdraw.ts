import { ResponseType } from '@type/api'
import { IPolicyResponse, IPolicyTable } from '@type/policyManagement'
import { apiService } from './apiService'

export const apiWithdraw = apiService.injectEndpoints({
  endpoints: (build) => ({
    getListWithdraw: build.query({
      query: ({ applicableObjectId, ...params }) => ({
        url: '/system-fee-management/get-policy-withdraw' + `?${applicableObjectId ? applicableObjectId : ''}`,
        method: 'GET',
        params: params
      }),
      transformResponse: (res: ResponseType<IPolicyResponse>) => res.data
    }),
    createWithdraw: build.mutation({
      query: (payload) => ({
        url: '/system-fee-management/create-policy-withdraw',
        method: 'POST',
        body: payload
      })
    }),
    updateWithdraw: build.mutation({
      query: ({ id, data }) => ({
        url: '/system-fee-management/update-policy-withdraw/' + id,
        method: 'PUT',
        body: { ...data }
      })
    }),
    deletePolicy: build.query({
      query: (id) => ({
        url: '/system-fee-management/' + id,
        method: 'DELETE'
      })
    })
  })
})

export const {
  useCreateWithdrawMutation,
  useGetListWithdrawQuery,
  useLazyDeletePolicyQuery,
  useUpdateWithdrawMutation 
} = apiWithdraw
