import { baseQueryFee, fetchBaseQueryCustom, fetchBaseQueryFee, fetchBaseQueryMerchant, fetchBaseQueryOld, fetchBaseQueryWalletCore } from '@configs/fetchBaseQueryCustom'
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
  reducerPath: 'feeApi',
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
export const apiWalletCore = createApi({
  reducerPath: 'walletCore',
  baseQuery: fetchBaseQueryWalletCore,
  tagTypes: [
    'historyTransaction',
    'Wallet',
    'ledgerEntries'
  ],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})
export const apiMerchant = createApi({
  reducerPath: 'merchant',
  baseQuery: fetchBaseQueryMerchant,
  tagTypes: [
    'merchant',
    'Order'
  ],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})