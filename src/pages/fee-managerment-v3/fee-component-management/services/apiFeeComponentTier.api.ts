import { apiFeeService } from '@services/apiService'
import { ResponseType } from '@type/api'
import { FeeTier } from '../types/FeeComponent.types'
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
    getFeeComponentTier: build.query({
      query: (id) => ({
        url: `/fee/component-tiers/by-component/${id}`,
        method: 'GET',
      }),
      transformResponse: (res: ResponseType<FeeTier[]>) => res.data,
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
  useDeleteFeeComponentTierMutation,
  usePutFeeComponentTierMutation
} = apiFeeComponentTier