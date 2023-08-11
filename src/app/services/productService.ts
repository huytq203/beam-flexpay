import { ResponseType } from '@type/api'
import { IProductPayload, IProductSearch } from '@type/product'
import { apiService } from './apiService'

export const productService = apiService.injectEndpoints({
  endpoints: (build) => ({
    getListService: build.query<IProductPayload, IProductSearch | any>({
      query: (params) => ({
        url: '/service',
        params: params
      }),
      transformResponse: (baseQueryReturnValue): IProductPayload => {
        return (baseQueryReturnValue as ResponseType<IProductPayload>).data
      },
      providesTags: ['productService']
    }),
    getListProduct: build.query<IProductPayload, IProductSearch | any>({
      query: (params) => ({
        url: '/group-product',
        params: params
      }),
      transformResponse: (baseQueryReturnValue): IProductPayload => {
        return (baseQueryReturnValue as ResponseType<IProductPayload>).data
      },
      providesTags: ['productService']
    }),
    viewProduct: build.query<ResponseType<any>, string>({
      query: (payload) => ({
        url: `/group-product/${payload}`,
        method: 'GET'
      }),
      providesTags: ['productService']
    }),
    deleteProduct: build.mutation({
      query: (payload) => ({
        url: `/group-product/${payload}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['productService']
    }),
    createProduct: build.mutation({
      query: (payload) => ({
        url: `/group-product`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['productService']
    }),
    updateProduct: build.mutation({
      query: ({ id, payload }) => ({
        url: `/group-product/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ['productService']
    }),
    listProductChild: build.query({
      query: () => ({
        url: `/product`,
        method: 'GET'
      }),
      providesTags: ['productService']
    }),
    createProductChild: build.mutation({
      query: (payload) => ({
        url: `/product`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['productService']
    }),
    updateProductChild: build.mutation({
      query: ({ id, ...payload }) => ({
        url: `/product/${id}`,
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: ['productService']
    }),
    detailProductChild: build.query({
      query: (id) => ({
        url: `/product/${id}`,
        method: 'GET'
      }),
      providesTags: ['productService']
    }),
    deleteProductChild: build.mutation({
      query: (id) => ({
        url: `/product/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['productService']
    }),
    listService: build.query<ResponseType<any>, string>({
      query: () => ({
        url: `/service/services`,
        method: 'GET'
      }),
      providesTags: ['productService']
    })
  })
})

export const {
  useLazyGetListServiceQuery,
  useGetListProductQuery,
  useLazyGetListProductQuery,
  useViewProductQuery,
  useLazyViewProductQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useCreateProductChildMutation,
  useUpdateProductChildMutation,
  useDetailProductChildQuery,
  useGetListServiceQuery,
  useListProductChildQuery,
  useDeleteProductChildMutation,
  useLazyListServiceQuery
} = productService
