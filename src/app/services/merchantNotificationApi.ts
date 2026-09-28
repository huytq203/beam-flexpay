import { apiMerchant } from './apiService'
import type {
  GatewayPage,
  GatewayResponse,
  InheritedValue
} from './merchantGatewayApi'

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK'
export type NotificationScope = 'MASTER' | 'SUB'
/** OWN = cấu hình riêng của phạm vi; INHERITED = lấy từ Master; SYSTEM_DEFAULT = chưa ai cấu hình. */
export type NotificationSource = 'OWN' | 'INHERITED' | 'SYSTEM_DEFAULT'

/** Một phạm vi trong danh sách, kể cả phạm vi chưa có cấu hình (configId null). */
export interface NotificationListItem {
  configId?: string | null
  /** Luôn là Master; `subMerchantId` null nghĩa là dòng của chính Master. */
  merchantId: string
  subMerchantId?: string | null
  merchantName: string
  merchantCode: string
  appliedLevel: NotificationScope
  source: NotificationSource
  transactionNotificationEnabled: boolean
  channels: NotificationChannel[]
  notificationEmails: string[]
  reconciliationEmails: string[]
  invoiceEmails: string[]
  active: boolean
  updatedAt?: string | null
  updatedBy?: string | null
  version?: number | null
}

export interface NotificationListQuery {
  page: number
  size: number
  search?: string
  scope?: NotificationScope
  source?: NotificationSource
}

export interface NotificationConfig {
  merchantId: string
  level: string
  transactionNotificationEnabled: InheritedValue<boolean>
  channels: InheritedValue<NotificationChannel[]>
  notificationEmails: InheritedValue<string[]>
  reconciliationEmails: InheritedValue<string[]>
  invoiceEmails: InheritedValue<string[]>
  configured: boolean
  active: boolean
  updatedAt?: string
  updatedBy?: string
  configId?: string | null
  subMerchantId?: string | null
  source?: NotificationSource
  version?: number | null
}

export interface NotificationFields {
  transactionNotificationEnabled: boolean
  channels: NotificationChannel[]
  notificationEmails: string[]
  reconciliationEmails: string[]
  invoiceEmails: string[]
  active: boolean
}

/** Nhóm email bị bỏ (undefined) sẽ dùng email chính của ví; [] là không gửi. */
export interface NotificationCreateBody extends Partial<NotificationFields> {
  masterMerchantId: string
  subMerchantId?: string
  reason?: string
}

/** Chỉ gửi field thực sự đổi kèm version của bản ghi để chống ghi đè. */
export interface NotificationPatchBody extends Partial<NotificationFields> {
  configId: string
  version: number
  reason: string
}

export interface NotificationChange {
  before: NotificationConfig
  after: NotificationConfig
  changes: Record<string, { oldValue: unknown; newValue: unknown }>
}

const unwrap = <T>(response: GatewayResponse<T>): T => response.data

export const merchantNotificationApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    listMerchantNotifications: builder.query<
      GatewayPage<NotificationListItem>,
      NotificationListQuery
    >({
      query: (params) => ({ url: '/merchants/notifications', params }),
      transformResponse: unwrap<GatewayPage<NotificationListItem>>,
      providesTags: ['merchant']
    }),
    createMerchantNotification: builder.mutation<
      NotificationConfig,
      NotificationCreateBody
    >({
      query: (body) => ({
        url: '/merchants/notifications',
        method: 'POST',
        body
      }),
      transformResponse: unwrap<NotificationConfig>,
      invalidatesTags: ['merchant']
    }),
    patchMerchantNotification: builder.mutation<
      NotificationChange,
      NotificationPatchBody
    >({
      query: ({ configId, ...body }) => ({
        url: `/merchants/notifications/${configId}`,
        method: 'PATCH',
        body
      }),
      transformResponse: unwrap<NotificationChange>,
      invalidatesTags: ['merchant']
    }),
    inheritMerchantNotification: builder.mutation<
      NotificationConfig,
      { configId: string; version: number; reason: string }
    >({
      query: ({ configId, version, reason }) => ({
        url: `/merchants/notifications/${configId}/inherit`,
        method: 'DELETE',
        params: { version, reason }
      }),
      transformResponse: unwrap<NotificationConfig>,
      invalidatesTags: ['merchant']
    })
  })
})

export const {
  useListMerchantNotificationsQuery,
  useCreateMerchantNotificationMutation,
  usePatchMerchantNotificationMutation,
  useInheritMerchantNotificationMutation
} = merchantNotificationApi
