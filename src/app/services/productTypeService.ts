import { ResponseType } from '@type/api'
import {
  IProductTypeSearch,
  IProductTypesPayload,
  IProductTypeTable
} from '@type/productType'
import { apiService } from './apiService'

const productTypeService = apiService.injectEndpoints({
  endpoints: (build) => ({
    productTypes: build.query<IProductTypesPayload, IProductTypeSearch | any>({
      query: (params) => ({
        url: '/product-type',
        params: params
      }),
      transformResponse: (baseQueryReturnValue): IProductTypesPayload => {
        return (baseQueryReturnValue as ResponseType<IProductTypesPayload>).data
      },
      providesTags: ['productTypeService']
    }),
    viewDetailProductType: build.query<ResponseType<IProductTypeTable>, string>(
      {
        query: (payload) => ({
          url: `/product-type/${payload}`,
          method: 'GET'
        })
      }
    ),
    listServiceId: build.query<ResponseType<any>, string>({
      query: () => ({
        url: `/service`,
        method: 'GET'
      })
    }),
    createProductType: build.mutation({
      query: (payload) => ({
        url: `/product-type`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['productTypeService']
    }),
    deleteProductType: build.mutation({
      query: (payload) => ({
        url: `/product-type/${payload}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['productTypeService']
    }),
    updateProductType: build.mutation({
      query: ({ id, ...payload }) => ({
        url: `/product-type/${id}`,
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: ['productTypeService']
    })
  })
})

export const {
  useProductTypesQuery,
  useViewDetailProductTypeQuery,
  useLazyViewDetailProductTypeQuery,
  useListServiceIdQuery,
  useCreateProductTypeMutation,
  useDeleteProductTypeMutation,
  useUpdateProductTypeMutation,
  useLazyProductTypesQuery
} = productTypeService
