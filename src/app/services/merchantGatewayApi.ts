import { apiMerchant } from './apiService'

export interface GatewayResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface GatewayPage<T> {
  content: T[]
  totalElements: number
  number: number
  size: number
}

export interface GatewayMerchant {
  id: string
  name: string
  code: string
  status?: string
}

export interface ApiCredential {
  id: string
  merchantId: string
  clientId: string
  name?: string
  ipWhitelist: string[]
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED'
  version?: number
  expiresAt?: string | null
  lastUsedAt?: string | null
  rotatedAt?: string | null
  previousSecretExpiresAt?: string | null
  revokedAt?: string | null
  revokedBy?: string | null
  revokeReason?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CredentialSecret {
  credential: ApiCredential
  secretKey: string
  previousSecretExpiresAt?: string
}

export type PaymentMethod =
  | 'QR'
  | 'DOMESTIC_CARD'
  | 'INTERNATIONAL_CARD'
  | 'LINKED_WALLET'
  | 'VIRTUAL_ACCOUNT'

export interface PaymentMethodLimit {
  method: PaymentMethod
  minAmount?: number
  maxAmount?: number
}

export interface InheritedValue<T> {
  value: T
  source?: 'SYSTEM_DEFAULT' | 'MASTER' | 'SUB' | 'TERMINAL'
  inherited?: boolean
  suspended?: boolean
}

export interface PaymentMethodSummary {
  paymentMethodConfigId?: string
  merchantId: string
  merchantName: string
  merchantCode: string
  appliedLevel: string
  enabledMethods: PaymentMethod[]
  configured: boolean
  isDefault: boolean
  active: boolean
  updatedAt?: string
}

export interface PaymentMethodConfig {
  merchantId: string
  level: string
  enabledMethods: InheritedValue<PaymentMethod[]>
  methodLimits: InheritedValue<PaymentMethodLimit[]>
  configured: boolean
  active: boolean
  updatedAt?: string
}

export interface WebhookConfig {
  merchantId: string
  url?: string
  enabled: boolean
  secretConfigured: boolean
  secretRotatedAt?: string
  updatedAt?: string
}

export const merchantGatewayApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getGatewayMerchants: builder.query<GatewayPage<GatewayMerchant>, { page: number; size: number; name?: string; code?: string }>({
      query: (params) => ({ url: '/merchants', params }),
      transformResponse: (response: GatewayResponse<GatewayPage<GatewayMerchant>>) => response.data
    }),
    getGatewayCredentials: builder.query<GatewayPage<ApiCredential>, { page: number; size: number; merchantId?: string; status?: ApiCredential['status'] }>({
      query: (params) => ({ url: '/merchant-api-credentials', params }),
      transformResponse: (response: GatewayResponse<GatewayPage<ApiCredential>>) => response.data,
      providesTags: ['merchant']
    }),
    createGatewayCredential: builder.mutation<CredentialSecret, { merchantId: string; name?: string; ipWhitelist: string[]; expiresAt?: string }>({
      query: (body) => ({ url: '/merchant-api-credentials', method: 'POST', body }),
      transformResponse: (response: GatewayResponse<CredentialSecret>) => response.data,
      invalidatesTags: ['merchant']
    }),
    rotateGatewayCredential: builder.mutation<CredentialSecret, { id: string; reason: string; gracePeriodMinutes?: number }>({
      query: ({ id, ...body }) => ({ url: `/merchant-api-credentials/${id}/rotate`, method: 'POST', body }),
      transformResponse: (response: GatewayResponse<CredentialSecret>) => response.data,
      invalidatesTags: ['merchant']
    }),
    revokeGatewayCredential: builder.mutation<ApiCredential, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({ url: `/merchant-api-credentials/${id}/revoke`, method: 'POST', body }),
      transformResponse: (response: GatewayResponse<ApiCredential>) => response.data,
      invalidatesTags: ['merchant']
    }),
    updateGatewayIpWhitelist: builder.mutation<ApiCredential, { id: string; ipWhitelist: string[]; reason: string }>({
      query: ({ id, ...body }) => ({ url: `/merchant-api-credentials/${id}/ip-whitelist`, method: 'PUT', body }),
      transformResponse: (response: GatewayResponse<ApiCredential>) => response.data,
      invalidatesTags: ['merchant']
    }),
    getGatewayWebhook: builder.query<WebhookConfig, string>({
      query: (id) => ({ url: `/merchants/${id}/webhook` }),
      transformResponse: (response: GatewayResponse<WebhookConfig>) => response.data
    }),
    updateGatewayWebhook: builder.mutation<{ webhook: WebhookConfig; secret?: string }, { id: string; url: string; enabled: boolean; regenerateSecret?: boolean; reason: string }>({
      query: ({ id, ...body }) => ({ url: `/merchants/${id}/webhook`, method: 'PUT', body }),
      transformResponse: (response: GatewayResponse<{ webhook: WebhookConfig; secret?: string }>) => response.data
    }),
    getGatewayPaymentMethods: builder.query<GatewayPage<PaymentMethodSummary>, { page: number; size: number }>({
      query: (params) => ({ url: '/merchants/payment-methods', params }),
      transformResponse: (response: GatewayResponse<GatewayPage<PaymentMethodSummary>>) => response.data,
      providesTags: ['merchant']
    }),
    getGatewayPaymentConfig: builder.query<PaymentMethodConfig, string>({
      query: (id) => ({ url: `/merchants/${id}/payment-methods` }),
      transformResponse: (response: GatewayResponse<PaymentMethodConfig>) => response.data,
      providesTags: ['merchant']
    }),
    updateGatewayPaymentConfig: builder.mutation<PaymentMethodConfig, { id: string; inherit: boolean; enabledMethods?: PaymentMethod[]; methodLimits?: PaymentMethodLimit[]; active?: boolean; reason: string }>({
      query: ({ id, ...body }) => ({ url: `/merchants/${id}/payment-methods`, method: 'PUT', body }),
      transformResponse: (response: GatewayResponse<PaymentMethodConfig>) => response.data,
      invalidatesTags: ['merchant']
    })
  })
})

export const {
  useGetGatewayMerchantsQuery,
  useGetGatewayCredentialsQuery,
  useCreateGatewayCredentialMutation,
  useRotateGatewayCredentialMutation,
  useRevokeGatewayCredentialMutation,
  useUpdateGatewayIpWhitelistMutation,
  useGetGatewayWebhookQuery,
  useUpdateGatewayWebhookMutation,
  useGetGatewayPaymentMethodsQuery,
  useGetGatewayPaymentConfigQuery,
  useUpdateGatewayPaymentConfigMutation
} = merchantGatewayApi
