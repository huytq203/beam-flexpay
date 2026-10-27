import { apiMerchant } from './apiService'
import type {
  CredentialOtpChallenge,
  GatewayPage,
  GatewayResponse,
  SensitiveOtpConfirmation
} from './merchantGatewayApi'

export type WebhookDeliveryStatus =
  | 'PENDING'
  | 'IN_FLIGHT'
  | 'DELIVERED'
  | 'DEAD'

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

export type WebhookLevel = 'MASTER' | 'SUB'
/** OWN = dòng riêng; INHERITED = Sub dùng cấu hình Master; NONE = chưa cấu hình. */
export type WebhookSource = 'OWN' | 'INHERITED' | 'NONE'

/**
 * Một dòng của danh sách (Master hoặc Sub). `INHERITED`: url/enabled/updatedAt/
 * updatedBy là của Master và `rowRevision = 0`; `NONE`: `url = null`, `enabled = false`.
 */
export interface WebhookListRow {
  merchantId: string
  merchantCode: string
  merchantName: string
  /** Null với dòng Master. */
  subMerchantId?: string | null
  subMerchantCode?: string | null
  subMerchantName?: string | null
  level: WebhookLevel
  source: WebhookSource
  url?: string | null
  enabled: boolean
  /** Chính là `expectedRevision` cho lần sửa/xóa kế tiếp. */
  rowRevision: number
  updatedAt?: string | null
  updatedBy?: string | null
  lastDeliveryStatus?: WebhookDeliveryStatus | null
  lastDeliveryAt?: string | null
}

/** Bộ lọc dùng chung của danh sách và xuất CSV (xuất bỏ `page`/`size`). */
export interface WebhookListFilters {
  /** Tên/mã Master hoặc Sub, chứa, không phân biệt hoa thường. */
  search?: string
  /** Bỏ trống = cả hai cấp. */
  scope?: WebhookLevel
  source?: WebhookSource
  /** Lọc theo dòng có hiệu lực. */
  enabled?: boolean
}

export interface WebhookListQuery extends WebhookListFilters {
  /** Từ 1, khác `deliveries` (từ 0). */
  page: number
  size: number
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

/** Xóa dòng riêng của Sub: `subMerchantId` bắt buộc, không có API xóa cấu hình Master. */
export interface WebhookDeleteBody {
  merchantId: string
  subMerchantId: string
  expectedRevision: number
  /** Bắt buộc, tối đa 500 ký tự. */
  reason: string
}

/** Kết quả xóa: webhook phẳng (không bọc `{ webhook }` như PUT), `inherited = true`. */
export type DeletedWebhook = MerchantWebhook

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
    // Master + Sub kèm cấu hình hiệu lực; sort không có tác dụng.
    listMerchantWebhooks: builder.query<
      GatewayPage<WebhookListRow>,
      WebhookListQuery
    >({
      query: (params) => ({ url: '/merchants/webhooks', params }),
      transformResponse: (
        response: GatewayResponse<GatewayPage<WebhookListRow>>
      ) => response.data,
      providesTags: ['merchant']
    }),
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
    // Hai bước OTP; `DELETE /merchants/{id}/webhook` cũ bị bỏ vì proxy hay làm rơi body.
    challengeWebhookDeleteOtp: builder.mutation<
      CredentialOtpChallenge,
      WebhookDeleteBody
    >({
      query: ({ merchantId, ...body }) => ({
        url: webhookUrl({ merchantId }, '/delete-otp-challenge'),
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<CredentialOtpChallenge>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING
    }),
    deleteSubMerchantWebhook: builder.mutation<
      DeletedWebhook,
      WebhookDeleteBody & { sensitiveOtp: SensitiveOtpConfirmation }
    >({
      query: ({ merchantId, ...body }) => ({
        url: webhookUrl({ merchantId }, '/delete'),
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<DeletedWebhook>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['merchant']
    }),
    // `page` bắt đầu từ 0; `subMerchantId` thu hẹp về đơn của Sub, bỏ trống = cả cây Master.
    getWebhookDeliveries: builder.query<
      GatewayPage<WebhookDelivery>,
      {
        merchantId: string
        subMerchantId?: string
        page: number
        size: number
      }
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
  useListMerchantWebhooksQuery,
  useChallengeWebhookDeleteOtpMutation,
  useDeleteSubMerchantWebhookMutation,
  useGetMerchantWebhookQuery,
  useChallengeWebhookOtpMutation,
  useUpdateMerchantWebhookMutation,
  useGetWebhookDeliveriesQuery
} = merchantWebhookApi
