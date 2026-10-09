import { apiUserWallet } from '@services/apiService'
import type {
  WalletLimitCreateBody,
  WalletLimitGroup,
  WalletLimitHistoryEntry,
  WalletLimitListParams,
  WalletLimitPage,
  WalletLimitPolicy,
  WalletLimitProfile,
  WalletLimitSpecialMonth,
  WalletLimitUpdateBody
} from '@type/walletLimit.type'

interface Envelope<T> {
  data: T
}

const unwrap = <T>(res: Envelope<T>): T => res.data

const LIST_TAG = { type: 'WalletLimitPolicy' as const, id: 'LIST' }
const historyTag = (id: string) => ({
  type: 'WalletLimitPolicy' as const,
  id: `HISTORY-${id}`
})
const MONTH_LIST_TAG = { type: 'WalletLimitSpecialMonth' as const, id: 'LIST' }

export interface WalletLimitHistoryParams {
  id: string
  page: number
  size: number
}

export interface WalletLimitProfileParams {
  username?: string
  page: number
  size: number
}

export const apiWalletLimit = apiUserWallet.injectEndpoints({
  endpoints: (build) => ({
    getWalletLimitPolicies: build.query<
      WalletLimitPage<WalletLimitPolicy>,
      WalletLimitListParams
    >({
      query: (params) => ({
        url: '/wallet-limit-policies',
        method: 'GET',
        params
      }),
      transformResponse: unwrap<WalletLimitPage<WalletLimitPolicy>>,
      providesTags: (result) => [
        LIST_TAG,
        ...(result?.content ?? []).map((item) => ({
          type: 'WalletLimitPolicy' as const,
          id: item.id
        }))
      ]
    }),
    getWalletLimitPolicy: build.query<WalletLimitPolicy, string>({
      query: (id) => ({
        url: `/wallet-limit-policies/${encodeURIComponent(id)}`,
        method: 'GET'
      }),
      transformResponse: unwrap<WalletLimitPolicy>,
      providesTags: (_result, _error, id) => [{ type: 'WalletLimitPolicy', id }]
    }),
    createWalletLimitPolicy: build.mutation<
      WalletLimitPolicy,
      WalletLimitCreateBody
    >({
      query: (body) => ({
        url: '/wallet-limit-policies',
        method: 'POST',
        body
      }),
      transformResponse: unwrap<WalletLimitPolicy>,
      invalidatesTags: [LIST_TAG]
    }),
    updateWalletLimitPolicy: build.mutation<
      WalletLimitPolicy,
      { id: string; body: WalletLimitUpdateBody }
    >({
      query: ({ id, body }) => ({
        url: `/wallet-limit-policies/${encodeURIComponent(id)}`,
        method: 'PUT',
        body
      }),
      transformResponse: unwrap<WalletLimitPolicy>,
      invalidatesTags: (_result, _error, { id }) => [
        LIST_TAG,
        { type: 'WalletLimitPolicy', id },
        historyTag(id)
      ]
    }),
    getWalletLimitHistory: build.query<
      WalletLimitPage<WalletLimitHistoryEntry>,
      WalletLimitHistoryParams
    >({
      query: ({ id, page, size }) => ({
        url: `/wallet-limit-policies/${encodeURIComponent(id)}/history`,
        method: 'GET',
        params: { page, size }
      }),
      transformResponse: unwrap<WalletLimitPage<WalletLimitHistoryEntry>>,
      providesTags: (_result, _error, { id }) => [historyTag(id)]
    }),
    getWalletLimitSpecialMonths: build.query<
      WalletLimitSpecialMonth[],
      { year?: number } | void
    >({
      query: (params) => ({
        url: '/wallet-limit-special-months',
        method: 'GET',
        params: params ?? undefined
      }),
      transformResponse: unwrap<WalletLimitSpecialMonth[]>,
      providesTags: [MONTH_LIST_TAG]
    }),
    createWalletLimitSpecialMonth: build.mutation<
      WalletLimitSpecialMonth,
      { month: string; name: string }
    >({
      query: (body) => ({
        url: '/wallet-limit-special-months',
        method: 'POST',
        body
      }),
      transformResponse: unwrap<WalletLimitSpecialMonth>,
      invalidatesTags: [MONTH_LIST_TAG]
    }),
    renameWalletLimitSpecialMonth: build.mutation<
      WalletLimitSpecialMonth,
      { id: string; name: string }
    >({
      query: ({ id, name }) => ({
        url: `/wallet-limit-special-months/${encodeURIComponent(id)}`,
        method: 'PUT',
        body: { name }
      }),
      transformResponse: unwrap<WalletLimitSpecialMonth>,
      invalidatesTags: [MONTH_LIST_TAG]
    }),
    deleteWalletLimitSpecialMonth: build.mutation<void, string>({
      query: (id) => ({
        url: `/wallet-limit-special-months/${encodeURIComponent(id)}`,
        method: 'DELETE'
      }),
      invalidatesTags: [MONTH_LIST_TAG]
    }),
    getWalletLimitProfiles: build.query<
      WalletLimitPage<WalletLimitProfile>,
      WalletLimitProfileParams
    >({
      query: (params) => ({
        url: '/wallet-limit-scopes/profiles',
        method: 'GET',
        params
      }),
      transformResponse: unwrap<WalletLimitPage<WalletLimitProfile>>
    }),
    getWalletLimitGroups: build.query<WalletLimitGroup[], void>({
      query: () => ({ url: '/wallet-limit-scopes/groups', method: 'GET' }),
      transformResponse: unwrap<WalletLimitGroup[]>
    })
  })
})

export const {
  useGetWalletLimitPoliciesQuery,
  useGetWalletLimitPolicyQuery,
  useCreateWalletLimitPolicyMutation,
  useUpdateWalletLimitPolicyMutation,
  useGetWalletLimitHistoryQuery,
  useGetWalletLimitSpecialMonthsQuery,
  useCreateWalletLimitSpecialMonthMutation,
  useRenameWalletLimitSpecialMonthMutation,
  useDeleteWalletLimitSpecialMonthMutation,
  useGetWalletLimitProfilesQuery,
  useGetWalletLimitGroupsQuery
} = apiWalletLimit
