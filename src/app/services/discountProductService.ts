import { ResponseType } from '@type/api'
import {
  IDiscountProductPayload,
  IDiscountProductSearch
} from '@type/discountProduct'
import { apiService } from './apiService'

export const discountProductService = apiService.injectEndpoints({
  endpoints: (build) => ({
    getListDiscountProduct: build.query<
      IDiscountProductPayload,
      IDiscountProductSearch | any
    >({
      query: (params) => ({
        url: '/product-discount',
        params: params
      }),
      transformResponse: (baseQueryReturnValue): IDiscountProductPayload => {
        return (baseQueryReturnValue as ResponseType<IDiscountProductPayload>)
          .data
      },
      providesTags: ['productDiscount']
    }),
    viewDiscountProduct: build.query({
      query: (payload) => ({
        url: `/product-discount/${payload}`,
        method: 'GET'
      }),
      providesTags: ['productDiscount']
    }),
    deleteDiscountProduct: build.mutation({
      query: (payload) => ({
        url: `/product-discount/${payload}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['productDiscount']
    }),
    createDiscountProduct: build.mutation({
      query: (payload) => ({
        url: `/product-discount`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['productDiscount']
    }),
    updateDiscountProduct: build.mutation({
      query: ({ id, ...payload }) => ({
        url: `/product-discount/${id}`,
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: ['productDiscount']
    }),
    createNotify: build.mutation({
      query: (payload) => ({
        url: `product-discount/${payload}/notify`,
        method: 'GET'
      })
    })
  })
})

export const {
  useGetListDiscountProductQuery,
  useDeleteDiscountProductMutation,
  useUpdateDiscountProductMutation,
  useCreateDiscountProductMutation,
  useViewDiscountProductQuery,
  useCreateNotifyMutation
} = discountProductService
