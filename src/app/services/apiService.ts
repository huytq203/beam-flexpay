import { fetchBaseQueryCustom } from '@configs/fetchBaseQueryCustom'
import { createApi } from '@reduxjs/toolkit/query/react'

export const apiService = createApi({
  baseQuery: fetchBaseQueryCustom,
  tagTypes: [
    'customerService',
    'productTypeService',
    'productService',
    'productDiscount',
    'ekycService'
  ],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})
