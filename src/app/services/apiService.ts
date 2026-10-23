import {
  fetchBaseQueryCustom,
  fetchBaseQueryFee,
  fetchBaseQueryMerchant,
  fetchBaseQueryOld,
  fetchBaseQueryUserWallet,
  fetchBaseQueryWalletCore
} from '@configs/fetchBaseQueryCustom'
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
    'feeBank',
    'feePartner',
    'customerSegment',
    'ApplicableFeeRule',
    'FeePolicySchedule'
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
    'ledgerEntries',
    'Journal',
    'Withdrawal'
  ],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})
export const apiUserWallet = createApi({
  reducerPath: 'userWallet',
  baseQuery: fetchBaseQueryUserWallet,
  tagTypes: ['WalletLimitPolicy', 'WalletLimitSpecialMonth', 'Refund'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})
export const apiMerchant = createApi({
  reducerPath: 'merchant',
  baseQuery: fetchBaseQueryMerchant,
  tagTypes: ['merchant', 'Order', 'Assignment'],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})

export const authApiService = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQueryCustom,
  tagTypes: [
    'Auth',
    'Profile',
    'roleManagement',
    'Permission',
    'PermissionAssign',
    'EKYC',
    'UserManagement',
    'UserDevices'
  ],
  endpoints: () => ({}),
  refetchOnMountOrArgChange: true
})
