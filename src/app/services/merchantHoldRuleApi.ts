import type { MerchantEnvelope } from '@type/merchant'
import type {
  HoldRuleChange,
  HoldRuleEffectiveQuery,
  HoldRuleHistoryQuery,
  HoldRulePolicy,
  HoldRuleProposalBody
} from '@/pages/merchant-management/merchant-hold-rule/types/holdRule.types'
import { apiMerchant } from './apiService'

// BE trả `message` là tên mã lỗi; màn tự chọn câu hiển thị theo `message`/`detail`.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data
const TAG = [{ type: 'merchant' as const, id: 'merchant-hold-rules' }]

const service = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getHoldRuleEffective: builder.query<HoldRulePolicy, HoldRuleEffectiveQuery>(
      {
        query: ({ masterId, subMerchantId }) => ({
          url: '/merchant-hold-rules/effective',
          params: { masterId, subMerchantId }
        }),
        extraOptions: OWN_ERROR_HANDLING,
        transformResponse: unwrap<HoldRulePolicy>,
        providesTags: TAG
      }
    ),
    getHoldRuleHistory: builder.query<HoldRuleChange[], HoldRuleHistoryQuery>({
      query: ({ targetLevel, targetId }) => ({
        url: '/merchant-hold-rules/history',
        params: { targetLevel, targetId }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<HoldRuleChange[]>,
      providesTags: TAG
    }),
    getHoldRulePending: builder.query<HoldRuleChange[], void>({
      query: () => '/merchant-hold-rules/pending',
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<HoldRuleChange[]>,
      providesTags: TAG
    }),
    proposeHoldRule: builder.mutation<HoldRuleChange, HoldRuleProposalBody>({
      query: (body) => ({ url: '/merchant-hold-rules', method: 'POST', body }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<HoldRuleChange>,
      invalidatesTags: TAG
    }),
    approveHoldRule: builder.mutation<HoldRuleChange, string>({
      query: (id) => ({
        url: `/merchant-hold-rules/${id}/approve`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<HoldRuleChange>,
      // Lỗi "đã được xử lý" cũng cần tải lại hàng đợi nên luôn làm mới tag.
      invalidatesTags: TAG
    }),
    rejectHoldRule: builder.mutation<
      HoldRuleChange,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/merchant-hold-rules/${id}/reject`,
        method: 'POST',
        params: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<HoldRuleChange>,
      invalidatesTags: TAG
    })
  })
})

export const {
  useGetHoldRuleEffectiveQuery,
  useGetHoldRuleHistoryQuery,
  useGetHoldRulePendingQuery,
  useProposeHoldRuleMutation,
  useApproveHoldRuleMutation,
  useRejectHoldRuleMutation
} = service
