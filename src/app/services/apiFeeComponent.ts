import { apiService } from './apiService'
import { ResponseType } from '@type/api'
import {
  feePolicyComponent,
  FeeComponentResponse
} from '@type/feePoliciesComponent'
import { method } from 'lodash'
export const feeComponentApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getFeeComponentPolicies: build.query({
      query: (params) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/policy-components`,
        method: 'GET',
        params: params
      }),
      transformResponse: (res: ResponseType<FeeComponentResponse>) => res.data
    }),
    getFeeComponentPoliciesById: build.query({
      query: (id: string) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/policy-components/by-policy/${id}`,
        method: 'GET',
      }),
      transformResponse: (res: ResponseType<feePolicyComponent[]>) => res.data
    }),
    deleteFeeComponentPolicies: build.mutation({
      query: (id: string) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/policy-components/${id}`,
        method: 'DELETE',
      })
    }),
    postFeeComponentPolicies: build.mutation({
      query: (body) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/policy-components`,
        method: 'POST',
        body:body
      })
    }),
  })
})
export const {
  useGetFeeComponentPoliciesQuery,
  useGetFeeComponentPoliciesByIdQuery,
  useDeleteFeeComponentPoliciesMutation,
  usePostFeeComponentPoliciesMutation
} = feeComponentApi
