import type { MerchantEnvelope } from '@type/merchant'
import type {
  LimitChangeDto,
  LimitHistoryQuery,
  LimitRequestBody
} from '@/pages/merchant-management/merchant-settlement/types/withdrawalLimit.types'
import { apiMerchant } from './apiService'

// BE trả `message` là tên enum; trang tự hiện câu `detail` tiếng Việt.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data
const TAG = [{ type: 'merchant' as const, id: 'merchant-limits' }]

const service = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    proposeWithdrawalLimit: builder.mutation<LimitChangeDto, LimitRequestBody>({
      query: (body) => ({ url: '/merchant-limits', method: 'POST', body }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<LimitChangeDto>,
      invalidatesTags: TAG
    }),
    getPendingLimitChanges: builder.query<LimitChangeDto[], void>({
      query: () => '/merchant-limits/pending',
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<LimitChangeDto[]>,
      providesTags: TAG
    }),
    getLimitHistory: builder.query<LimitChangeDto[], LimitHistoryQuery>({
      query: ({ targetLevel, targetId }) => ({
        url: '/merchant-limits',
        params: { policyDomain: 'WITHDRAWAL', targetLevel, targetId }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<LimitChangeDto[]>,
      providesTags: TAG
    }),
    approveLimitChange: builder.mutation<LimitChangeDto, string>({
      query: (id) => ({
        url: `/merchant-limits/${id}/approve`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<LimitChangeDto>,
      invalidatesTags: TAG
    }),
    rejectLimitChange: builder.mutation<
      LimitChangeDto,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/merchant-limits/${id}/reject`,
        method: 'POST',
        params: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<LimitChangeDto>,
      invalidatesTags: TAG
    }),
    deactivateLimitChange: builder.mutation<
      LimitChangeDto,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/merchant-limits/${id}/deactivate`,
        method: 'POST',
        params: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<LimitChangeDto>,
      invalidatesTags: TAG
    })
  })
})

export const {
  useProposeWithdrawalLimitMutation,
  useGetPendingLimitChangesQuery,
  useGetLimitHistoryQuery,
  useApproveLimitChangeMutation,
  useRejectLimitChangeMutation,
  useDeactivateLimitChangeMutation
} = service
