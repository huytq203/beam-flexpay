import type { MerchantEnvelope } from '@type/merchant'
import type {
  EffectiveAtDto,
  HistoryQuery,
  HistoryRowRaw,
  RemovalPreview,
  ScopeConfigView,
  ScopeUpdateBody
} from '@/pages/merchant-management/merchant-settlement-scope/types/settlementScope.types'
import { apiMerchant } from './apiService'

// BE trả `message` là tên enum; trang tự map sang câu tiếng Việt.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data
const MASTER_TAG = (id: string) => ({
  type: 'merchant' as const,
  id: `settlement-scope-master-${id}`
})
const SYSTEM_TAG = { type: 'merchant' as const, id: 'settlement-scope-system' }
const HISTORY_TAG = {
  type: 'merchant' as const,
  id: 'settlement-scope-history'
}

const service = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getMasterSettlementConfig: builder.query<ScopeConfigView, string>({
      query: (id) => `/merchants/${id}/settlement-config`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<ScopeConfigView>,
      providesTags: (_r, _e, id) => [MASTER_TAG(id)]
    }),
    getMasterRemovalPreview: builder.query<RemovalPreview, string>({
      query: (id) => `/merchants/${id}/settlement-config/removal-preview`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<RemovalPreview>,
      providesTags: (_r, _e, id) => [MASTER_TAG(id)]
    }),
    updateMasterSettlementConfig: builder.mutation<
      ScopeConfigView,
      { id: string; body: ScopeUpdateBody }
    >({
      query: ({ id, body }) => ({
        url: `/merchants/${id}/settlement-config`,
        method: 'PUT',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<ScopeConfigView>,
      invalidatesTags: (_r, _e, { id }) => [MASTER_TAG(id), HISTORY_TAG]
    }),
    removeMasterSettlementConfig: builder.mutation<
      ScopeConfigView,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/merchants/${id}/settlement-config`,
        method: 'DELETE',
        params: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<ScopeConfigView>,
      invalidatesTags: (_r, _e, { id }) => [MASTER_TAG(id), HISTORY_TAG]
    }),
    getSystemSettlementConfig: builder.query<ScopeConfigView, void>({
      query: () => '/settlement-config/system',
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<ScopeConfigView>,
      providesTags: [SYSTEM_TAG]
    }),
    updateSystemSettlementConfig: builder.mutation<
      ScopeConfigView,
      ScopeUpdateBody
    >({
      query: (body) => ({
        url: '/settlement-config/system',
        method: 'PUT',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<ScopeConfigView>,
      invalidatesTags: [SYSTEM_TAG, HISTORY_TAG]
    }),
    getSettlementConfigHistory: builder.query<HistoryRowRaw[], HistoryQuery>({
      query: ({ level, targetId }) => ({
        url: '/settlement-config/history',
        params: { level, targetId }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<HistoryRowRaw[]>,
      providesTags: [HISTORY_TAG]
    }),
    getSubSettlementConfigAt: builder.query<
      EffectiveAtDto,
      { id: string; at: string }
    >({
      query: ({ id, at }) => ({
        url: `/sub-merchants/${id}/settlement-config/at`,
        params: { at }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EffectiveAtDto>
    })
  })
})

export const {
  useGetMasterSettlementConfigQuery,
  useGetMasterRemovalPreviewQuery,
  useUpdateMasterSettlementConfigMutation,
  useRemoveMasterSettlementConfigMutation,
  useGetSystemSettlementConfigQuery,
  useUpdateSystemSettlementConfigMutation,
  useGetSettlementConfigHistoryQuery,
  useGetSubSettlementConfigAtQuery
} = service
