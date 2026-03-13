
import { apiFeeService, apiService } from "./apiService";
import { ResponseType } from '@type/api'
import { feePolicies, FeePoliciesResponse } from '@pages/fee-management-v3/constants/feePolicies'
export const feePolicyApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getFeePolicies: build.query({
      query: (pagination) => ({
        url: `/fee/policies`,
        method: "GET",
        params: pagination // { page, size, sortBy, sortDirection }
      }),
      transformResponse: (res: ResponseType<FeePoliciesResponse>) => res.data,
      providesTags: ['FeePolicy']
    }),
    searchFeePolicies: build.query({
      query: (params) => ({
        url: `/fee/policies/search`,
        method: "GET",
        params: params,

      }),
      transformResponse: (res: ResponseType<FeePoliciesResponse>) => res.data,
      providesTags: ['FeePolicy']
    }),
    getFeePolicyById: build.query({
      query: (id) => ({
        url: `/fee/policies/${id}`,
        method: "GET"
      }),
      transformResponse: (res: ResponseType<feePolicies>) => res.data,
      providesTags: ['FeePolicy']
    }),
    postNewPolicy: build.mutation({
      query: (body) => ({
        url: `/fee/policies`,
        method: "POST",
        body: body,
        params: { isLoading: false }
      }),
      invalidatesTags: ['FeePolicy']
    }),
    patchDeactivateFee: build.mutation({
      query: (id) => ({
        url: `/fee/policies/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ['FeePolicy']
    }),
    patchActivateFee: build.mutation({
      query: (id) => ({
        url: `/fee/policies/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ['FeePolicy']
    }),
    putFeePolicy: build.mutation({
      query: ({ id, body }) => ({
        url: `/fee/policies/${id}`,
        method: "PUT",
        body: body
      }),
      invalidatesTags: ['FeePolicy']
    })
  })
});
export const {
  useSearchFeePoliciesQuery,
  useLazySearchFeePoliciesQuery,
  useGetFeePoliciesQuery,
  useLazyGetFeePoliciesQuery,
  useGetFeePolicyByIdQuery,
  usePostNewPolicyMutation,
  usePatchDeactivateFeeMutation,
  usePatchActivateFeeMutation,
  usePutFeePolicyMutation
} = feePolicyApi;
