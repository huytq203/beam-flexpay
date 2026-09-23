import { apiFeeService } from './apiService'
import type { FeeAssignment, FeePage } from '@type/fee.type'
type FeeAssignResponse = FeePage<FeeAssignment>
import { ResponseType } from '@type/api'
import type { FeeApprovalArg, FeeReasonArg } from '@type/feeApproval.type'
const feeAssignApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getAssignSearch: build.query<FeeAssignResponse, Record<string, unknown>>({
      query: (params) => ({
        url: `/fee/policy-assignments/search`,
        method: "GET",
        params: params
      }),
      transformResponse: (res: ResponseType<FeeAssignResponse>) => res.data,
      providesTags: ['feeAssign']
    }),
    getAssignById: build.query<FeeAssignment, string | undefined>({
      query: (id) => ({
        url: `/fee/policy-assignments/${id}`,
        method: "GET",
      }),
      transformResponse: (res: ResponseType<FeeAssignment>) => res.data,
      providesTags: ['feeAssign']
    }),
    /** Bản gán của một chính sách, dùng khi tải màn chi tiết cấu hình. */
    getAssignmentsByPolicy: build.query<FeeAssignment[], string>({
      keepUnusedDataFor: 300,
      query: (feePolicyId) => ({
        url: `/fee/policy-assignments/by-policy/${feePolicyId}`,
        method: 'GET',
        params: { isLoading: false }
      }),
      transformResponse: (res: ResponseType<FeeAssignment[]>) => res.data,
      providesTags: ['feeAssign']
    }),
    postAssign: build.mutation({
      query: (body) => ({
        url: `/fee/policy-assignments`,
        method: "POST",
        body: body
      }),
      invalidatesTags: ['feeAssign']
    }),
    putAssign: build.mutation({
      query: ({ id, body }) => ({
        url: `/fee/policy-assignments/${id}`,
        method: "PUT",
        body: body
      }),
      invalidatesTags: ['feeAssign']
    }),
    patchAssignActive: build.mutation<ResponseType<FeeAssignment>, FeeReasonArg>({
      query: ({ id, reason }) => ({
        url: `/fee/policy-assignments/${id}/activate`,
        method: "PATCH",
        params: { reason }
      }),
      invalidatesTags: ['feeAssign']
    }),
    patchAssignInActive: build.mutation<ResponseType<FeeAssignment>, string>({
      query: (id) => ({
        url: `/fee/policy-assignments/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ['feeAssign']
    }),
    patchApproveAssign: build.mutation<ResponseType<FeeAssignment>, FeeApprovalArg>({
      query: ({ id, ...body }) => ({
        url: `/fee/policy-assignments/${id}/approve`,
        method: "PATCH",
        body
      }),
      extraOptions: { suppressGlobalLoading: true },
      invalidatesTags: ['feeAssign']
    }),
    patchRejectAssign: build.mutation<ResponseType<FeeAssignment>, FeeReasonArg>({
      query: ({ id, reason }) => ({
        url: `/fee/policy-assignments/${id}/reject`,
        method: "PATCH",
        params: { reason }
      }),
      extraOptions: { suppressGlobalLoading: true },
      invalidatesTags: ['feeAssign']
    }),
  })
})
export const {
  usePostAssignMutation,
  useGetAssignByIdQuery,
  usePutAssignMutation,
  usePatchAssignActiveMutation,
  usePatchAssignInActiveMutation,
  usePatchApproveAssignMutation,
  usePatchRejectAssignMutation,
  useGetAssignSearchQuery,
  useGetAssignmentsByPolicyQuery
} = feeAssignApi
