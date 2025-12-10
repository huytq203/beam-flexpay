import { feeComponentApi } from './apiFeeComponent'
import { apiService } from './apiService'
import { ResponseType } from '@type/api'
import {
  feePolicyComponent,
  FeeComponentResponse
} from '@type/feePoliciesComponent'
export const apiFeeComponentTier = apiService.injectEndpoints({
  endpoints: (build) => ({
    postFeeComponentTier: build.mutation({
      query: (body) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/component-tiers`,
        method: 'POST',
        body: body
      }),
      invalidatesTags: ['feeComponentTier']
    }),
    getFeeComponentTier: build.query({
      query: (id) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/component-tiers/by-component/${id}`,
        method: 'GET',
      }),
      transformResponse: (res: ResponseType<any[]>) => res.data,
      providesTags: ['feeComponentTier']
    }),
   deleteFeeComponentTier: build.mutation({
      query: (id) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/component-tiers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['feeComponentTier']
    }),
   putFeeComponentTier: build.mutation({
      query: ({id,body}) => ({
        url: `${import.meta.env.VITE_FEE_API_URL}/fee/component-tiers/${id}`,
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