import type { MerchantEnvelope } from '@type/merchant'
import type { SettlementUpdateBody } from '@/pages/merchant-management/merchant-settlement/dto/settlementConfig.dto'
import type {
  SettlementChangeDto,
  SettlementConfigDto
} from '@/pages/merchant-management/merchant-settlement/types/settlementConfig.types'
import { apiMerchant } from './apiService'

// BE trả `message` là tên enum; trang tự hiện câu `detail` tiếng Việt.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data
const tagOf = (_result: unknown, _error: unknown, id: string) => [
  { type: 'merchant' as const, id: `settlement-${id}` }
]

const service = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getSubSettlementConfig: builder.query<SettlementConfigDto, string>({
      query: (id) => `/sub-merchants/${id}/settlement-config`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SettlementConfigDto>,
      providesTags: tagOf
    }),
    updateSubSettlementConfig: builder.mutation<
      SettlementConfigDto,
      { id: string; body: SettlementUpdateBody }
    >({
      query: ({ id, body }) => ({
        url: `/sub-merchants/${id}/settlement-config`,
        method: 'PUT',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SettlementConfigDto>,
      invalidatesTags: (result, error, { id }) => tagOf(result, error, id)
    }),
    getSettlementChanges: builder.query<SettlementChangeDto[], string>({
      query: (id) => `/sub-merchants/${id}/settlement-config/changes`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SettlementChangeDto[]>,
      providesTags: tagOf
    }),
    approveSettlementChange: builder.mutation<
      SettlementConfigDto,
      { id: string; changeId: string }
    >({
      query: ({ id, changeId }) => ({
        url: `/sub-merchants/${id}/settlement-config/changes/${changeId}/approve`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SettlementConfigDto>,
      invalidatesTags: (result, error, { id }) => tagOf(result, error, id)
    }),
    rejectSettlementChange: builder.mutation<
      SettlementConfigDto,
      { id: string; changeId: string; note?: string }
    >({
      query: ({ id, changeId, note }) => ({
        url: `/sub-merchants/${id}/settlement-config/changes/${changeId}/reject`,
        method: 'POST',
        params: { note }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SettlementConfigDto>,
      invalidatesTags: (result, error, { id }) => tagOf(result, error, id)
    })
  })
})

export const {
  useGetSubSettlementConfigQuery,
  useUpdateSubSettlementConfigMutation,
  useGetSettlementChangesQuery,
  useApproveSettlementChangeMutation,
  useRejectSettlementChangeMutation
} = service
