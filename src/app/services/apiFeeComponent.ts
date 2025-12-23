import { apiFeeService, apiService } from './apiService'
import { ResponseType } from '@type/api'
import {
  feePolicyComponent,
  FeeComponentResponse
} from '@type/feePoliciesComponent'
export const feeComponentApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getFeeComponentPolicies: build.query({
      query: (params) => ({
        url: `/fee/policy-components`,
        method: 'GET',
        params: params
      }),
      transformResponse: (res: ResponseType<FeeComponentResponse>) => res.data,
      providesTags: ['FeePolicyComponent']
    }),
    getFeeComponentPoliciesById: build.query({
      query: (id: string) => ({
        url: `/fee/policy-components/by-policy/${id}`,
        method: 'GET',
      }),
      transformResponse: (res: ResponseType<feePolicyComponent[]>) => res.data,
      providesTags: ['FeePolicyComponent']
    }),
    getFeeComponentById: build.query({
      query: (id: string) => ({
        url: `/fee/policy-components/${id}`,
        method: 'GET',
      }),
      transformResponse: (res: ResponseType<feePolicyComponent>) => res.data,
      providesTags: ['FeePolicyComponent']
    }),
    deleteFeeComponentPolicies: build.mutation({
      query: (id: string) => ({
        url: `/fee/policy-components/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeePolicyComponent']
    }),
    postFeeComponentPolicies: build.mutation({
      query: (body) => ({
        url: `/fee/policy-components`,
        method: 'POST',
        body: body
      }),
      invalidatesTags: ['FeePolicyComponent']
    }),
     putFeeComponentPolicies: build.mutation({
      query: ({id,body}) => ({
        url: `/fee/policy-components/${id}`,
        method: 'PUT',
        body: body
      }),
      invalidatesTags: ['FeePolicyComponent']
    }),
  })
})
export const {
  useGetFeeComponentPoliciesQuery,
  useGetFeeComponentPoliciesByIdQuery,
  useGetFeeComponentByIdQuery,
  useDeleteFeeComponentPoliciesMutation,
  usePostFeeComponentPoliciesMutation,
  usePutFeeComponentPoliciesMutation
} = feeComponentApi
