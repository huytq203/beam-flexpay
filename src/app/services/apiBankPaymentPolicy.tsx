import { ResponseType } from '@type/api'
import { IPolicyResponse, IPolicyTable } from '@type/policyManagement'
import { apiService } from './apiService'

export const apiBankPaymentPolicy = apiService.injectEndpoints({
  endpoints: (build) => ({
    getListBankPaymentPolicy: build.query({
      query: ({ applicableObjectId, ...params }) => ({
        url:
          '/system-fee-management/get-policy-transfer-with-bank-card' +
          `?${applicableObjectId ? applicableObjectId : ''}`,
        method: 'GET',
        params: params
      }),
      transformResponse: (res: ResponseType<IPolicyResponse>) => res.data
    }),
    createBankPaymentPolicy: build.mutation({
      query: (payload) => ({
        url: '/system-fee-management/create-policy-transfer-with-bank-card',
        method: 'POST',
        body: payload
      })
    }),
    updateBankPaymentPolicy: build.mutation({
      query: ({ id, data }) => ({
        url:
          '/system-fee-management/update-policy-transfer-with-bank-card/' + id,
        method: 'PUT',
        body: { ...data }
      })
    }),
    getDetailPolicy: build.query({
      query: (id) => ({
        url: '/system-fee-management/' + id,
        method: 'GET'
      }),
      transformResponse: (res: ResponseType<IPolicyTable>) => res.data
    })
  })
})

export const {
  useCreateBankPaymentPolicyMutation,
  useUpdateBankPaymentPolicyMutation,
  useLazyGetDetailPolicyQuery,
  useGetListBankPaymentPolicyQuery
} = apiBankPaymentPolicy
