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

/** Cơ chế xác thực: HMAC dùng secret, RSA dùng public key của merchant. */
export type MerchantApiAuthMode = 'HMAC_SHA256' | 'RSA_SHA256'

/** EXPIRED được BE suy ra khi đọc nếu `expiresAt` đã qua (trừ khi đã REVOKED). */
export type ApiCredentialStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED'

export interface ApiCredential {
  id: string
  merchantId: string
  subMerchantId?: string | null
  authMode?: MerchantApiAuthMode
  clientId: string
  name?: string | null
  /** Rỗng = không giới hạn IP. */
  ipWhitelist: string[]
  status: ApiCredentialStatus
  /** Thế hệ khóa, KHÔNG dùng để khóa lạc quan. */
  version?: number
  /** Gửi lại dưới tên `expectedRevision` cho mọi thao tác thay đổi. */
  rowRevision?: number
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

/** Phản hồi tạo/xoay/đổi cấu hình: `secretKey` chỉ có một lần và chỉ với HMAC. */
export interface CredentialSecret {
  credential: ApiCredential
  secretKey: string | null
  previousSecretExpiresAt?: string | null
}

export interface ApiCredentialListParams {
  merchantId?: string
  status?: ApiCredentialStatus
}

export interface SensitiveOtpConfirmation {
  otpSessionId: string
  otp: string
}

export interface CredentialOtpChallenge {
  otpSessionId: string
  maskedRecipient: string
  expiresInSeconds: number
  canResendAfterSeconds: number
}

export interface CreateCredentialBody {
  merchantId: string
  authMode: MerchantApiAuthMode
  merchantPublicKey?: string
  subMerchantId?: string
  name?: string
  ipWhitelist: string[]
}

export interface RotateCredentialBody {
  reason: string
  expectedRevision: number
  merchantPublicKey?: string
}

export interface RevokeCredentialBody {
  reason: string
  expectedRevision: number
}

export interface IpWhitelistBody {
  ipWhitelist: string[]
  reason: string
  expectedRevision: number
}

export type CredentialChangeAction =
  | 'ROTATE'
  | 'REVOKE'
  | 'IP_WHITELIST'
  | 'STATUS'
  | 'CONVERT'

/** Body của `{id}/otp-challenge` và `PUT {id}/configuration`. */
export interface CredentialChangeBody {
  expectedRevision: number
  action: CredentialChangeAction
  reason: string
  authMode?: MerchantApiAuthMode
  merchantPublicKey?: string
  status?: 'ACTIVE' | 'SUSPENDED'
  ipWhitelist?: string[]
}

export type WithOtp<T> = T & { sensitiveOtp: SensitiveOtpConfirmation }
type WithId<T> = T & { id: string }

/** Lệnh ghi gửi thử không kèm OTP để BE chạy hết kiểm tra nghiệp vụ trước. */
export interface CredentialCommand {
  url: string
  method: 'POST' | 'PUT'
  body: object
}

export type CredentialPrecheckResult =
  | { otpRequired: true }
  | { otpRequired: false; data: unknown }

export interface SignatureTestBody {
  authMode: MerchantApiAuthMode
  canonicalRequest: string
  signature: string
}

export interface SignatureDryRunBody extends SignatureTestBody {
  merchantPublicKey: string
}

export type SignatureTestResultCode =
  | 'VALID'
  | 'SIGNATURE_INVALID'
  | 'NON_CANONICAL_REQUEST'
  | 'AUTH_MODE_MISMATCH'
  | 'INACTIVE_CREDENTIAL'

export interface SignatureTestResult {
  verified: boolean
  result: SignatureTestResultCode
  authMode: MerchantApiAuthMode
}

export interface SignatureHistoryItem {
  id: string
  credentialVersion: number
  authMode: string
  sourceIp: string | null
  requestId: string | null
  requestTimestamp: string | null
  verificationResult: string
  verifiedAt: string
}

export interface BeamPublicKey {
  purpose: string
  keyId: string
  algorithm: string
  publicKeyPem: string
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

const CREDENTIALS = '/merchant-api-credentials'
/** Màn tự hiển thị `detail` của lỗi, tắt thông báo tập trung trùng lặp. */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

/** BE báo thiếu OTP (5731) — chỉ xảy ra khi mọi kiểm tra nghiệp vụ đã qua. */
const isOtpRequiredError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object' || !('data' in error)) return false
  const { data } = error
  return (
    !!data &&
    typeof data === 'object' &&
    'message' in data &&
    data.message === 'MERCHANT_SENSITIVE_OTP_REQUIRED'
  )
}

export const merchantGatewayApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getGatewayMerchants: builder.query<
      GatewayPage<GatewayMerchant>,
      { page: number; size: number; name?: string; code?: string }
    >({
      query: (params) => ({ url: '/merchants', params }),
      transformResponse: (
        response: GatewayResponse<GatewayPage<GatewayMerchant>>
      ) => response.data
    }),
    getGatewayCredentials: builder.query<
      GatewayPage<ApiCredential>,
      ApiCredentialListParams & { page: number; size: number }
    >({
      query: (params) => ({ url: CREDENTIALS, params }),
      transformResponse: (
        response: GatewayResponse<GatewayPage<ApiCredential>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    getGatewayCredential: builder.query<ApiCredential, string>({
      query: (id) => ({ url: `${CREDENTIALS}/${id}` }),
      transformResponse: (response: GatewayResponse<ApiCredential>) =>
        response.data,
      providesTags: ['merchant']
    }),
    // Gửi lệnh ghi không kèm `sensitiveOtp`: BE kiểm tra nghiệp vụ (5902, PEM,
    // IP, phiên bản...) trước rồi mới báo thiếu OTP (5731). Nhận 5731 nghĩa là
    // lệnh hợp lệ, lúc đó mới xin OTP để không tốn SMS cho lệnh chắc chắn lỗi.
    precheckGatewayCredentialCommand: builder.mutation<
      CredentialPrecheckResult,
      CredentialCommand
    >({
      async queryFn(command, _api, _extraOptions, baseQuery) {
        const result = await baseQuery(command)
        if (!result.error) {
          const envelope = result.data as GatewayResponse<unknown> | undefined
          return { data: { otpRequired: false, data: envelope?.data } }
        }
        if (isOtpRequiredError(result.error))
          return { data: { otpRequired: true } }
        return { error: result.error }
      },
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: (result) =>
        result && !result.otpRequired ? ['merchant'] : []
    }),
    challengeCreateCredentialOtp: builder.mutation<
      CredentialOtpChallenge,
      {
        merchantId: string
        subMerchantId?: string
        authMode: MerchantApiAuthMode
      }
    >({
      query: (body) => ({
        url: `${CREDENTIALS}/otp-challenge`,
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<CredentialOtpChallenge>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING
    }),
    challengeCredentialChangeOtp: builder.mutation<
      CredentialOtpChallenge,
      WithId<CredentialChangeBody>
    >({
      query: ({ id, ...body }) => ({
        url: `${CREDENTIALS}/${id}/otp-challenge`,
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<CredentialOtpChallenge>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING
    }),
    createGatewayCredential: builder.mutation<
      CredentialSecret,
      WithOtp<CreateCredentialBody>
    >({
      query: (body) => ({ url: CREDENTIALS, method: 'POST', body }),
      transformResponse: (response: GatewayResponse<CredentialSecret>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['merchant']
    }),
    rotateGatewayCredential: builder.mutation<
      CredentialSecret,
      WithId<WithOtp<RotateCredentialBody>>
    >({
      query: ({ id, ...body }) => ({
        url: `${CREDENTIALS}/${id}/rotate`,
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<CredentialSecret>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['merchant']
    }),
    revokeGatewayCredential: builder.mutation<
      ApiCredential,
      WithId<WithOtp<RevokeCredentialBody>>
    >({
      query: ({ id, ...body }) => ({
        url: `${CREDENTIALS}/${id}/revoke`,
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<ApiCredential>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['merchant']
    }),
    updateGatewayIpWhitelist: builder.mutation<
      ApiCredential,
      WithId<WithOtp<IpWhitelistBody>>
    >({
      query: ({ id, ...body }) => ({
        url: `${CREDENTIALS}/${id}/ip-whitelist`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: GatewayResponse<ApiCredential>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['merchant']
    }),
    changeGatewayCredentialConfiguration: builder.mutation<
      CredentialSecret,
      WithId<WithOtp<CredentialChangeBody>>
    >({
      query: ({ id, ...body }) => ({
        url: `${CREDENTIALS}/${id}/configuration`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: GatewayResponse<CredentialSecret>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: ['merchant']
    }),
    verifyGatewayCredentialSignature: builder.mutation<
      SignatureTestResult,
      WithId<SignatureTestBody>
    >({
      query: ({ id, ...body }) => ({
        url: `${CREDENTIALS}/${id}/verify-signature`,
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<SignatureTestResult>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING
    }),
    dryRunGatewayCredentialSignature: builder.mutation<
      SignatureTestResult,
      WithId<SignatureDryRunBody>
    >({
      query: ({ id, ...body }) => ({
        url: `${CREDENTIALS}/${id}/signature-dry-run`,
        method: 'POST',
        body
      }),
      transformResponse: (response: GatewayResponse<SignatureTestResult>) =>
        response.data,
      extraOptions: OWN_ERROR_HANDLING
    }),
    // `page` của lịch sử chữ ký tính từ 0 (khác các danh sách khác tính từ 1).
    getGatewayCredentialSignatureHistory: builder.query<
      GatewayPage<SignatureHistoryItem>,
      { id: string; page: number; size: number }
    >({
      query: ({ id, ...params }) => ({
        url: `${CREDENTIALS}/${id}/signature-history`,
        params
      }),
      transformResponse: (
        response: GatewayResponse<GatewayPage<SignatureHistoryItem>>
      ) => response.data
    }),
    getGatewayBeamPublicKeys: builder.query<BeamPublicKey[], void>({
      query: () => ({ url: `${CREDENTIALS}/beam-public-keys` }),
      transformResponse: (response: GatewayResponse<BeamPublicKey[]>) =>
        response.data
    }),
    getGatewayPaymentMethods: builder.query<
      GatewayPage<PaymentMethodSummary>,
      { page: number; size: number }
    >({
      query: (params) => ({ url: '/merchants/payment-methods', params }),
      transformResponse: (
        response: GatewayResponse<GatewayPage<PaymentMethodSummary>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    getGatewayPaymentConfig: builder.query<PaymentMethodConfig, string>({
      query: (id) => ({ url: `/merchants/${id}/payment-methods` }),
      transformResponse: (response: GatewayResponse<PaymentMethodConfig>) =>
        response.data,
      providesTags: ['merchant']
    }),
    updateGatewayPaymentConfig: builder.mutation<
      PaymentMethodConfig,
      {
        id: string
        inherit: boolean
        enabledMethods?: PaymentMethod[]
        methodLimits?: PaymentMethodLimit[]
        active?: boolean
        reason: string
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/merchants/${id}/payment-methods`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: GatewayResponse<PaymentMethodConfig>) =>
        response.data,
      invalidatesTags: ['merchant']
    })
  })
})

export const {
  useGetGatewayMerchantsQuery,
  useGetGatewayCredentialsQuery,
  useGetGatewayCredentialQuery,
  usePrecheckGatewayCredentialCommandMutation,
  useChallengeCreateCredentialOtpMutation,
  useChallengeCredentialChangeOtpMutation,
  useCreateGatewayCredentialMutation,
  useRotateGatewayCredentialMutation,
  useRevokeGatewayCredentialMutation,
  useUpdateGatewayIpWhitelistMutation,
  useChangeGatewayCredentialConfigurationMutation,
  useVerifyGatewayCredentialSignatureMutation,
  useDryRunGatewayCredentialSignatureMutation,
  useGetGatewayCredentialSignatureHistoryQuery,
  useGetGatewayBeamPublicKeysQuery,
  useGetGatewayPaymentMethodsQuery,
  useGetGatewayPaymentConfigQuery,
  useUpdateGatewayPaymentConfigMutation
} = merchantGatewayApi
