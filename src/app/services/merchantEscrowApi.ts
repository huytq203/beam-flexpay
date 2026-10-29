import type { MerchantEnvelope, MerchantPage } from '@type/merchant'
import type {
  EscrowConfig,
  EscrowConfigPreview,
  EscrowConfigRequest,
  EscrowContributionRow,
  EscrowLedgerEntry,
  EscrowOrder,
  EscrowOrderCreate,
  EscrowOrderImpact,
  EscrowOrderStatus,
  EscrowOrderView,
  EscrowOverview,
  EscrowReturn,
  EscrowReturnCreate,
  EscrowReturnPiece,
  EscrowReturnPlan,
  EscrowReturnResubmit,
  EscrowRisk,
  EscrowRow,
  EscrowSaveResult,
  EscrowState,
  EscrowVerification
} from '@/pages/merchant-management/merchant-escrow/types/merchantEscrow.types'
import { apiMerchant } from './apiService'
import type { CredentialOtpChallenge, WithOtp } from './merchantGatewayApi'

// Màn tự hiển thị lỗi nghiệp vụ (409 phiên bản cũ, trùng mã tham chiếu...) nên tắt thông báo chung.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data

// Một tag dùng chung cho cả ba nhóm (cấu hình, lệnh nạp, lệnh hoàn trả): duyệt một lệnh làm đổi
// số dư/trạng thái ở danh sách Master và chi tiết, nên mọi mutation đều làm mới toàn bộ.
const TAG = [{ type: 'merchant' as const, id: 'merchant-escrow' }]

const ESCROWS = '/merchant-escrows'
const ORDERS = '/merchant-escrow-orders'
const RETURNS = '/merchant-escrow-returns'

export interface EscrowListParams {
  search?: string
  /** `OVERDUE` chỉ là bộ lọc (đã quá hạn), không phải trạng thái của dòng. */
  state?: EscrowState | 'OVERDUE'
  risk?: EscrowRisk
  /** `OVERDUE` hoặc số ngày còn lại tối đa (vd. '7', '30'). */
  dueIn?: string
  page: number
  size: number
  sort?: string
}

/** Lý do (nhập tự do, không có độ dài tối thiểu) đi kèm OTP khi từ chối. */
export interface EscrowDecisionBody {
  reason?: string
  sensitiveOtp?: { otpSessionId: string; otp: string }
}

export const escrowApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------------------------------------------------------- Ký quỹ (Master)
    getEscrowList: builder.query<MerchantPage<EscrowRow>, EscrowListParams>({
      query: (params) => ({ url: ESCROWS, params }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<MerchantPage<EscrowRow>>,
      providesTags: TAG
    }),
    getEscrowOverview: builder.query<EscrowOverview, string>({
      query: (masterId) => `${ESCROWS}/${masterId}`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOverview>,
      providesTags: TAG
    }),
    getEscrowLedger: builder.query<
      MerchantPage<EscrowLedgerEntry>,
      { masterId: string; page: number; size: number }
    >({
      query: ({ masterId, page, size }) => ({
        url: `${ESCROWS}/${masterId}/ledger`,
        params: { page, size }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<MerchantPage<EscrowLedgerEntry>>,
      providesTags: TAG
    }),
    getEscrowContributions: builder.query<
      EscrowContributionRow[],
      { masterId: string; asOf?: string }
    >({
      query: ({ masterId, asOf }) => ({
        url: `${ESCROWS}/${masterId}/contributions`,
        params: { asOf }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowContributionRow[]>,
      providesTags: TAG
    }),
    verifyEscrowLedger: builder.mutation<EscrowVerification, string>({
      query: (masterId) => ({
        url: `${ESCROWS}/${masterId}/ledger/verify`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowVerification>
    }),
    clearEscrowReturnBlock: builder.mutation<void, string>({
      query: (masterId) => ({
        url: `${ESCROWS}/${masterId}/return-block/clear`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<void>,
      invalidatesTags: TAG
    }),
    getEscrowConfigHistory: builder.query<EscrowConfig[], string>({
      query: (masterId) => `${ESCROWS}/${masterId}/config-history`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowConfig[]>,
      providesTags: TAG
    }),
    previewEscrowConfig: builder.mutation<
      EscrowConfigPreview,
      { masterId: string; body: EscrowConfigRequest }
    >({
      query: ({ masterId, body }) => ({
        url: `${ESCROWS}/${masterId}/config-preview`,
        method: 'POST',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowConfigPreview>
    }),
    challengeEscrowConfigSave: builder.mutation<CredentialOtpChallenge, string>(
      {
        query: (masterId) => ({
          url: `${ESCROWS}/${masterId}/config/otp-challenge`,
          method: 'POST'
        }),
        extraOptions: OWN_ERROR_HANDLING,
        transformResponse: unwrap<CredentialOtpChallenge>
      }
    ),
    saveEscrowConfig: builder.mutation<
      EscrowSaveResult,
      { masterId: string; body: WithOtp<EscrowConfigRequest> }
    >({
      query: ({ masterId, body }) => ({
        url: `${ESCROWS}/${masterId}/config`,
        method: 'PUT',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowSaveResult>,
      // Lỗi 409 (phiên bản cũ) cũng cần tải lại, nên làm mới cả khi thất bại.
      invalidatesTags: TAG
    }),
    getEscrowConfigPending: builder.query<EscrowConfig[], void>({
      query: () => `${ESCROWS}/config-proposals/pending`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowConfig[]>,
      providesTags: TAG
    }),
    challengeEscrowConfigApprove: builder.mutation<
      CredentialOtpChallenge,
      string
    >({
      query: (id) => ({
        url: `${ESCROWS}/config-proposals/${id}/otp-challenge`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<CredentialOtpChallenge>
    }),
    approveEscrowConfig: builder.mutation<
      EscrowConfig,
      { id: string; sensitiveOtp: { otpSessionId: string; otp: string } }
    >({
      query: ({ id, sensitiveOtp }) => ({
        url: `${ESCROWS}/config-proposals/${id}/approve`,
        method: 'POST',
        body: { sensitiveOtp }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowConfig>,
      invalidatesTags: TAG
    }),
    // Từ chối cấu hình: BE nhận `note` là query param, không có body và không cần OTP.
    rejectEscrowConfig: builder.mutation<
      EscrowConfig,
      { id: string; note: string }
    >({
      query: ({ id, note }) => ({
        url: `${ESCROWS}/config-proposals/${id}/reject`,
        method: 'POST',
        params: { note }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowConfig>,
      invalidatesTags: TAG
    }),
    cancelEscrowConfig: builder.mutation<EscrowConfig, string>({
      query: (id) => ({
        url: `${ESCROWS}/config-proposals/${id}/cancel`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowConfig>,
      invalidatesTags: TAG
    }),

    // ---------------------------------------------------------------- Lệnh nạp ký quỹ
    getEscrowOrders: builder.query<
      MerchantPage<EscrowOrder>,
      {
        status?: EscrowOrderStatus
        masterId?: string
        page: number
        size: number
      }
    >({
      query: (params) => ({ url: ORDERS, params }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<MerchantPage<EscrowOrder>>,
      providesTags: TAG
    }),
    getEscrowOrder: builder.query<EscrowOrderView, string>({
      query: (id) => `${ORDERS}/${id}`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOrderView>,
      providesTags: TAG
    }),
    previewEscrowOrder: builder.mutation<EscrowOrderImpact, EscrowOrderCreate>({
      query: (body) => ({ url: `${ORDERS}/preview`, method: 'POST', body }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOrderImpact>
    }),
    challengeEscrowOrderCreate: builder.mutation<
      CredentialOtpChallenge,
      string
    >({
      query: (masterId) => ({
        url: `${ORDERS}/otp-challenge`,
        method: 'POST',
        params: { masterId }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<CredentialOtpChallenge>
    }),
    challengeEscrowOrderDecision: builder.mutation<
      CredentialOtpChallenge,
      { id: string; reject: boolean }
    >({
      query: ({ id, reject }) => ({
        url: `${ORDERS}/${id}/otp-challenge`,
        method: 'POST',
        params: { reject }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<CredentialOtpChallenge>
    }),
    createEscrowOrder: builder.mutation<
      EscrowOrder,
      WithOtp<EscrowOrderCreate>
    >({
      query: (body) => ({ url: ORDERS, method: 'POST', body }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOrder>,
      invalidatesTags: TAG
    }),
    approveEscrowOrder: builder.mutation<
      EscrowOrder,
      { id: string; body: EscrowDecisionBody }
    >({
      query: ({ id, body }) => ({
        url: `${ORDERS}/${id}/approve`,
        method: 'POST',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOrder>,
      invalidatesTags: TAG
    }),
    rejectEscrowOrder: builder.mutation<
      EscrowOrder,
      { id: string; body: EscrowDecisionBody }
    >({
      query: ({ id, body }) => ({
        url: `${ORDERS}/${id}/reject`,
        method: 'POST',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOrder>,
      invalidatesTags: TAG
    }),
    // Trả lại để người lập sửa: bắt buộc lý do, không cần OTP.
    returnEscrowOrder: builder.mutation<
      EscrowOrder,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `${ORDERS}/${id}/return`,
        method: 'POST',
        body: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOrder>,
      invalidatesTags: TAG
    }),
    resubmitEscrowOrder: builder.mutation<
      EscrowOrder,
      { id: string; body: WithOtp<EscrowOrderCreate> }
    >({
      query: ({ id, body }) => ({
        url: `${ORDERS}/${id}/resubmit`,
        method: 'POST',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOrder>,
      invalidatesTags: TAG
    }),
    cancelEscrowOrder: builder.mutation<
      EscrowOrder,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `${ORDERS}/${id}/cancel`,
        method: 'POST',
        params: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowOrder>,
      invalidatesTags: TAG
    }),

    // ---------------------------------------------------------------- Lệnh hoàn trả ký quỹ
    // Danh sách trả mảng thuần, không phân trang.
    getEscrowReturns: builder.query<
      EscrowReturn[],
      { status?: EscrowOrderStatus; masterId?: string }
    >({
      query: (params) => ({ url: RETURNS, params }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturn[]>,
      providesTags: TAG
    }),
    getEscrowReturn: builder.query<EscrowReturn, string>({
      query: (id) => `${RETURNS}/${id}`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturn>,
      providesTags: TAG
    }),
    previewEscrowReturn: builder.mutation<EscrowReturnPlan, EscrowReturnCreate>(
      {
        query: (body) => ({ url: `${RETURNS}/preview`, method: 'POST', body }),
        extraOptions: OWN_ERROR_HANDLING,
        transformResponse: unwrap<EscrowReturnPlan>
      }
    ),
    challengeEscrowReturnCreate: builder.mutation<
      CredentialOtpChallenge,
      string
    >({
      query: (masterId) => ({
        url: `${RETURNS}/otp-challenge`,
        method: 'POST',
        params: { masterId }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<CredentialOtpChallenge>
    }),
    challengeEscrowReturnDecision: builder.mutation<
      CredentialOtpChallenge,
      { id: string; reject: boolean }
    >({
      query: ({ id, reject }) => ({
        url: `${RETURNS}/${id}/otp-challenge`,
        method: 'POST',
        params: { reject }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<CredentialOtpChallenge>
    }),
    createEscrowReturn: builder.mutation<
      EscrowReturn,
      WithOtp<EscrowReturnCreate>
    >({
      query: (body) => ({ url: RETURNS, method: 'POST', body }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturn>,
      invalidatesTags: TAG
    }),
    approveEscrowReturn: builder.mutation<
      EscrowReturn,
      { id: string; body: EscrowDecisionBody }
    >({
      query: ({ id, body }) => ({
        url: `${RETURNS}/${id}/approve`,
        method: 'POST',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturn>,
      invalidatesTags: TAG
    }),
    rejectEscrowReturn: builder.mutation<
      EscrowReturn,
      { id: string; body: EscrowDecisionBody }
    >({
      query: ({ id, body }) => ({
        url: `${RETURNS}/${id}/reject`,
        method: 'POST',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturn>,
      invalidatesTags: TAG
    }),
    returnEscrowReturn: builder.mutation<
      EscrowReturn,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `${RETURNS}/${id}/return`,
        method: 'POST',
        body: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturn>,
      invalidatesTags: TAG
    }),
    resubmitEscrowReturn: builder.mutation<
      EscrowReturn,
      { id: string; body: WithOtp<EscrowReturnResubmit> }
    >({
      query: ({ id, body }) => ({
        url: `${RETURNS}/${id}/resubmit`,
        method: 'POST',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturn>,
      invalidatesTags: TAG
    }),
    cancelEscrowReturn: builder.mutation<
      EscrowReturn,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `${RETURNS}/${id}/cancel`,
        method: 'POST',
        params: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturn>,
      invalidatesTags: TAG
    }),
    // Kế toán xử lý mảnh chuyển khoản lỗi: thử lại (tiền vẫn giữ chỗ) hoặc trả về ký quỹ.
    retryEscrowReturnPiece: builder.mutation<EscrowReturnPiece, string>({
      query: (pieceId) => ({
        url: `${RETURNS}/pieces/${pieceId}/retry-transfer`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturnPiece>,
      invalidatesTags: TAG
    }),
    releaseEscrowReturnPiece: builder.mutation<EscrowReturnPiece, string>({
      query: (pieceId) => ({
        url: `${RETURNS}/pieces/${pieceId}/release`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<EscrowReturnPiece>,
      invalidatesTags: TAG
    }),
    // Số ngày chờ sau giao dịch cuối trước khi hoàn với lý do chấm dứt hợp đồng (1–365).
    getEscrowObligationWait: builder.query<number, string>({
      query: (masterId) => `${RETURNS}/obligation-wait/${masterId}`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<number>,
      providesTags: TAG
    }),
    setEscrowObligationWait: builder.mutation<
      number,
      { masterId: string; days: number }
    >({
      query: ({ masterId, days }) => ({
        url: `${RETURNS}/obligation-wait/${masterId}`,
        method: 'PUT',
        body: { days }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<number>,
      invalidatesTags: TAG
    })
  })
})

export const {
  useGetEscrowListQuery,
  useGetEscrowOverviewQuery,
  useGetEscrowLedgerQuery,
  useGetEscrowContributionsQuery,
  useVerifyEscrowLedgerMutation,
  useClearEscrowReturnBlockMutation,
  useGetEscrowConfigHistoryQuery,
  usePreviewEscrowConfigMutation,
  useChallengeEscrowConfigSaveMutation,
  useSaveEscrowConfigMutation,
  useGetEscrowConfigPendingQuery,
  useChallengeEscrowConfigApproveMutation,
  useApproveEscrowConfigMutation,
  useRejectEscrowConfigMutation,
  useCancelEscrowConfigMutation,
  useGetEscrowOrdersQuery,
  useGetEscrowOrderQuery,
  usePreviewEscrowOrderMutation,
  useChallengeEscrowOrderCreateMutation,
  useChallengeEscrowOrderDecisionMutation,
  useCreateEscrowOrderMutation,
  useApproveEscrowOrderMutation,
  useRejectEscrowOrderMutation,
  useReturnEscrowOrderMutation,
  useResubmitEscrowOrderMutation,
  useCancelEscrowOrderMutation,
  useGetEscrowReturnsQuery,
  useGetEscrowReturnQuery,
  usePreviewEscrowReturnMutation,
  useChallengeEscrowReturnCreateMutation,
  useChallengeEscrowReturnDecisionMutation,
  useCreateEscrowReturnMutation,
  useApproveEscrowReturnMutation,
  useRejectEscrowReturnMutation,
  useReturnEscrowReturnMutation,
  useResubmitEscrowReturnMutation,
  useCancelEscrowReturnMutation,
  useRetryEscrowReturnPieceMutation,
  useReleaseEscrowReturnPieceMutation,
  useGetEscrowObligationWaitQuery,
  useSetEscrowObligationWaitMutation
} = escrowApi
