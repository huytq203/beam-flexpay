import { apiFeeService, apiService } from './apiService'
import { FeeAssignment, FeeAssignmentResponse, FeeAssignResponse } from '@type/feeAssignment'
import { ResponseType } from '@type/api'
export const feeAssignApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getAssign: build.query<FeeAssignResponse, any>({
      query: (params) => ({
        url: `/fee/policy-assignments`,
        method: "GET",
        params: params
      }),
      transformResponse: (res: ResponseType<FeeAssignResponse>) => res.data,
      providesTags: ['feeAssign']
    }),
    getAssignSearch: build.query<FeeAssignResponse, any>({
      query: (params) => ({
        url: `/fee/policy-assignments/search`,
        method: "GET",
        params: params
      }),
      transformResponse: (res: any) => res.data,
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
    patchAssignActive: build.mutation({
      query: (id) => ({
        url: `/fee/policy-assignments/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ['feeAssign']
    }),
    patchAssignInActive: build.mutation({
      query: (id) => ({
        url: `/fee/policy-assignments/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ['feeAssign']
    }),
  })
})
export const {
  useGetAssignQuery,
  usePostAssignMutation,
  useGetAssignByIdQuery,
  usePutAssignMutation,
  usePatchAssignActiveMutation,
  usePatchAssignInActiveMutation,
  useLazyGetAssignSearchQuery
} = feeAssignApi