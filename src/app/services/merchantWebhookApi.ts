import { apiMerchant } from './apiService'
import type {
  CredentialOtpChallenge,
  GatewayPage,
  GatewayResponse,
  SensitiveOtpConfirmation
} from './merchantGatewayApi'

/** Cấu hình IPN của Master, hoặc của một Sub khi gọi kèm `subMerchantId`. */
export interface MerchantWebhook {
  merchantId: string
  subMerchantId?: string | null
  /** `true`: Sub chưa có dòng riêng, url/enabled/updatedAt là của Master. */
  inherited: boolean
  /** Gửi lại làm `expectedRevision`; 0 khi chưa có dòng của phạm vi này. */
  rowRevision: number
  url?: string | null
  enabled: boolean
  updatedAt?: string | null
}

export interface WebhookScope {
  merchantId: string
  subMerchantId?: string
}

/** Body dùng chung cho `otp-challenge` và `PUT` (chỉ PUT mới có `sensitiveOtp`). */
export interface WebhookChangeBody {
  url?: string
  enabled?: boolean
  reason: string
  expectedRevision: number
}

export type WebhookDeliveryStatus =
  | 'PENDING'
  | 'IN_FLIGHT'
  | 'DELIVERED'
  | 'DEAD'

export interface WebhookDelivery {
  eventId: string
  orderId: string
  orderStatus: 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELLED'
  status: WebhookDeliveryStatus
  attempts: number
  lastHttpStatus?: number | null
  lastError?: string | null
  createdAt: string
  completedAt?: string | null
}

/** Màn tự hiển thị `detail` của lỗi, tắt thông báo tập trung trùng lặp. */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

const webhookUrl = ({ merchantId }: WebhookScope, suffix = '') =>
  `/merchants/${merchantId}/webhook${suffix}`

const scopeParams = ({ subMerchantId }: WebhookScope) =>
  subMerchantId ? { subMerchantId } : undefined

export const merchantWebhookApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getMerchantWebhook: builder.query<MerchantWebhook, WebhookScope>({
      query: (scope) => ({
        url: webhookUrl(scope),
        params: scopeParams(scope)
      }),
      transformResponse: (response: GatewayResponse<MerchantWebhook>) =>
        response.data,
      providesTags: ['merchant']
    }),
    challengeWebhookOtp: builder.mutation<
      CredentialOtpChallenge,
      WebhookScope & WebhookChangeBody
    >({
      query: ({ merchantId, subMerchantId, ...body }) => ({
        url: webhookUrl({ merchantId }, '/otp-challenge'),
        method: 'POST',
        params: scopeParams({ merchantId, subMerchantId }),
        body
      }),
      transformResponse: (response: GatewayResponse<CredentialOtpChallenge>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING
    }),
    updateMerchantWebhook: builder.mutation<
      MerchantWebhook,
      WebhookScope &
        WebhookChangeBody & { sensitiveOtp: SensitiveOtpConfirmation }
    >({
      query: ({ merchantId, subMerchantId, ...body }) => ({
        url: webhookUrl({ merchantId }),
        method: 'PUT',
        params: scopeParams({ merchantId, subMerchantId }),
        body
      }),
      transformResponse: (
        response: GatewayResponse<{ webhook: MerchantWebhook }>
      ) => response.data.webhook,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['merchant']
    }),
    // `page` bắt đầu từ 0; BE chưa lọc theo Sub nên luôn là lịch sử của cả Master.
    getWebhookDeliveries: builder.query<
      GatewayPage<WebhookDelivery>,
      { merchantId: string; page: number; size: number }
    >({
      query: ({ merchantId, ...params }) => ({
        url: webhookUrl({ merchantId }, '/deliveries'),
        params
      }),
      transformResponse: (
        response: GatewayResponse<GatewayPage<WebhookDelivery>>
      ) => response.data,
      providesTags: ['merchant']
    })
  })
})

export const {
  useGetMerchantWebhookQuery,
  useChallengeWebhookOtpMutation,
  useUpdateMerchantWebhookMutation,
  useGetWebhookDeliveriesQuery
} = merchantWebhookApi
