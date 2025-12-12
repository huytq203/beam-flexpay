import { feeComponentApi } from './apiFeeComponent'
import { apiService } from './apiService'
import { ResponseType } from '@type/api'
import {
  feePolicyComponent,
  FeeComponentResponse
} from '@type/feePoliciesComponent'
const baseURL=import.meta.env.VITE_FEE_API_URL
export const apiFeeComponentTier = apiService.injectEndpoints({
  endpoints: (build) => ({
    postFeeComponentTier: build.mutation({
      query: (body) => ({
        url: `${baseURL}/fee/component-tiers`,
        method: 'POST',
        body: body
      }),
      invalidatesTags: ['feeComponentTier']
    }),
    getFeeComponentTier: build.query({
      query: (id) => ({
        url: `${baseURL}/fee/component-tiers/by-component/${id}`,
        method: 'GET',
      }),
      transformResponse: (res: ResponseType<any[]>) => res.data,
      providesTags: ['feeComponentTier']
    }),
   deleteFeeComponentTier: build.mutation({
      query: (id) => ({
        url: `${baseURL}/fee/component-tiers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['feeComponentTier']
    }),
   putFeeComponentTier: build.mutation({
      query: ({body}) => ({
        url: `${baseURL}/fee/component-tiers`,
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