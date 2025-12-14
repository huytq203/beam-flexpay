import { fetchBaseQueryCustom } from '@configs/fetchBaseQueryCustom'
import { createApi } from '@reduxjs/toolkit/query/react'

export const apiService = createApi({
  baseQuery: fetchBaseQueryCustom,
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
    'feeAssign'
  ],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})
