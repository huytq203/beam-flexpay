import { apiMerchant } from './apiService'
import type {
  GatewayPage,
  GatewayResponse,
  PaymentMethod,
  PaymentMethodConfig,
  PaymentMethodSummary
} from './merchantGatewayApi'

/** Một dòng của `GET /merchants/payment-methods`: dòng Master hoặc dòng Sub có cấu hình riêng. */
export interface PaymentMethodListRow extends PaymentMethodSummary {
  subMerchantId?: string | null
  subMerchantName?: string | null
  subMerchantCode?: string | null
  createdAt?: string | null
  updatedBy?: string | null
}

export interface PaymentMethodListQuery {
  page: number
  size: number
}

/** Khả năng bật từng hình thức; `eligible=false` thì BE từ chối bật (5506). */
export interface PaymentMethodCapability {
  method: PaymentMethod
  supported: boolean
  eligible: boolean
  reasonCode?: string | null
  reason?: string | null
}

/** Cấu hình hiệu lực của một cấp (Master hoặc Sub) theo luồng GET/PATCH mới. */
export interface ScopedPaymentMethodConfig extends PaymentMethodConfig {
  masterMerchantId?: string
  subMerchantId?: string | null
  /** Version của dòng cung cấp giá trị hiệu lực; null khi là mặc định hệ thống. */
  version?: number | null
  capabilities?: PaymentMethodCapability[]
  updatedBy?: string | null
}

export interface PaymentMethodScopeArgs {
  masterId: string
  /** Bỏ trống = cấp Master. */
  subMerchantId?: string
}

/** Body PATCH; `methodLimits` không bao giờ gửi (BE trả 1005, hạn mức sửa ở màn Cấu hình hạn mức). */
export interface PaymentMethodPatchBody {
  inherit?: boolean
  enabledMethods?: PaymentMethod[]
  active?: boolean
  version?: number
  reason: string
}

export interface PaymentMethodInheritArgs {
  masterId: string
  subMerchantId: string
  reason: string
  version?: number
}

const scopedUrl = ({ masterId, subMerchantId }: PaymentMethodScopeArgs) =>
  subMerchantId
    ? `/merchants/${masterId}/sub-merchants/${subMerchantId}/payment-methods`
    : `/merchants/${masterId}/payment-methods`

const unwrap = <T>(response: GatewayResponse<T>): T => response.data

export const merchantPaymentMethodApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethodList: builder.query<
      GatewayPage<PaymentMethodListRow>,
      PaymentMethodListQuery
    >({
      query: (params) => ({ url: '/merchants/payment-methods', params }),
      transformResponse: unwrap<GatewayPage<PaymentMethodListRow>>,
      providesTags: ['merchant']
    }),
    getScopedPaymentMethodConfig: builder.query<
      ScopedPaymentMethodConfig,
      PaymentMethodScopeArgs
    >({
      query: (args) => ({ url: scopedUrl(args) }),
      transformResponse: unwrap<ScopedPaymentMethodConfig>,
      providesTags: ['merchant']
    }),
    patchPaymentMethodConfig: builder.mutation<
      ScopedPaymentMethodConfig,
      PaymentMethodScopeArgs & { body: PaymentMethodPatchBody }
    >({
      query: ({ body, ...scope }) => ({
        url: scopedUrl(scope),
        method: 'PATCH',
        body
      }),
      transformResponse: unwrap<ScopedPaymentMethodConfig>,
      invalidatesTags: ['merchant']
    }),
    inheritSubPaymentMethodConfig: builder.mutation<
      ScopedPaymentMethodConfig,
      PaymentMethodInheritArgs
    >({
      query: ({ masterId, subMerchantId, reason, version }) => ({
        url: scopedUrl({ masterId, subMerchantId }),
        method: 'DELETE',
        params: version === undefined ? { reason } : { reason, version }
      }),
      transformResponse: unwrap<ScopedPaymentMethodConfig>,
      invalidatesTags: ['merchant']
    })
  })
})

export const {
  useGetPaymentMethodListQuery,
  useGetScopedPaymentMethodConfigQuery,
  usePatchPaymentMethodConfigMutation,
  useInheritSubPaymentMethodConfigMutation
} = merchantPaymentMethodApi
