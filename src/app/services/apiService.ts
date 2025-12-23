import { baseQueryFee, fetchBaseQueryCustom, fetchBaseQueryFee, fetchBaseQueryOld } from '@configs/fetchBaseQueryCustom'
import { createApi } from '@reduxjs/toolkit/query/react'

export const apiService = createApi({
  baseQuery: fetchBaseQueryOld,
  tagTypes: [
    'customerService',
    'productTypeService',
    'productService',
    'productDiscount',
    'ekycService',
    'internal-wallet-group',
    'internal-wallet-account',
    'accounting',
    'accounting-requests',
    'FeePolicy',
    'FeePolicyComponent',
    'feeComponentTier',
    'feeAssign',
    'feeBank'
  ],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})


export const apiFeeService = createApi({
  baseQuery: fetchBaseQueryFee,
  tagTypes: [
    'FeePolicy',
    'FeePolicyComponent',
    'feeComponentTier',
    'feeAssign',
    'feeBank'
  
  ],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})