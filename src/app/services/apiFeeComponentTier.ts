import { apiFeeService } from './apiService'
import { ResponseType } from '@type/api'
import type { FeeComponentTier } from '@type/fee.type'
export const apiFeeComponentTier = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    postFeeComponentTier: build.mutation({
      query: (body) => ({
        url: `/fee/component-tiers`,
        method: 'POST',
        body: body
      }),
      invalidatesTags: ['feeComponentTier']
    }),
    getFeeComponentTier: build.query<FeeComponentTier[], string>({
      keepUnusedDataFor: 300,
      query: (feeComponentId: string) => ({
        url: `/fee/component-tiers/by-component/${feeComponentId}`,
        method: 'GET',
      }),
      transformResponse: (res: ResponseType<FeeComponentTier[]>) => res.data,
      providesTags: ['feeComponentTier']
    }),
    deleteFeeComponentTier: build.mutation({
      query: (id) => ({
        url: `/fee/component-tiers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['feeComponentTier']
    }),
    putFeeComponentTier: build.mutation({
      query: ({ body }) => ({
        url: `/fee/component-tiers`,
        method: 'PUT',
        body: body
      }),
      invalidatesTags: ['feeComponentTier']
    }),
  })
})
export const {
  usePostFeeComponentTierMutation,
  useGetFeeComponentTierQuery,
  useLazyGetFeeComponentTierQuery,
  useDeleteFeeComponentTierMutation,
  usePutFeeComponentTierMutation
} = apiFeeComponentTier
