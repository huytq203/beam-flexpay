
import { FeePolicy, FeePolicyResponse } from "@pages/fee-management-v4/fee-management/types/FeeManagement.type";
import { apiFeeService } from "@services/apiService"
import { ResponseType } from '@type/api'
import type { FeeApprovalArg, FeeReasonArg } from '@type/feeApproval.type'
export const feePolicyApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getFeePolicies: build.query({
      query: (pagination) => ({
        url: `/fee/policies`,
        method: "GET",
        params: pagination // { page, size, sortBy, sortDirection }
      }),
      transformResponse: (res: ResponseType<FeePolicyResponse>) => res.data,
      providesTags: ['FeePolicy']
    }),
    searchFeePolicies: build.query({
      query: (params) => ({
        url: `/fee/policies/search`,
        method: "GET",
        params: params,

      }),
      transformResponse: (res: ResponseType<FeePolicyResponse>) => res.data,
      providesTags: ['FeePolicy']
    }),
    getFeePolicyById: build.query({
      query: (id) => ({
        url: `/fee/policies/${id}`,
        method: "GET"
      }),
      transformResponse: (res: ResponseType<FeePolicy>) => res.data,
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
    patchDeactivateFee: build.mutation<ResponseType<FeePolicy>, string>({
      query: (id) => ({
        url: `/fee/policies/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ['FeePolicy']
    }),
    patchActivateFee: build.mutation<ResponseType<FeePolicy>, FeeReasonArg>({
      query: ({ id, reason }) => ({
        url: `/fee/policies/${id}/activate`,
        method: "PATCH",
        params: { reason }
      }),
      invalidatesTags: ['FeePolicy']
    }),
    patchApproveFeePolicy: build.mutation<ResponseType<FeePolicy>, FeeApprovalArg>({
      query: ({ id, ...body }) => ({
        url: `/fee/policies/${id}/approve`,
        method: "PATCH",
        body,
        params: { isLoading: false }
      }),
      invalidatesTags: ['FeePolicy']
    }),
    patchRejectFeePolicy: build.mutation<ResponseType<FeePolicy>, FeeReasonArg>({
      query: ({ id, reason }) => ({
        url: `/fee/policies/${id}/reject`,
        method: "PATCH",
        params: { isLoading: false, reason }
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
  useLazySearchFeePoliciesQuery,
  useGetFeePoliciesQuery,
  useLazyGetFeePoliciesQuery,
  useGetFeePolicyByIdQuery,
  usePostNewPolicyMutation,
  usePatchDeactivateFeeMutation,
  usePatchActivateFeeMutation,
  usePatchApproveFeePolicyMutation,
  usePatchRejectFeePolicyMutation,
  usePutFeePolicyMutation
} = feePolicyApi;
