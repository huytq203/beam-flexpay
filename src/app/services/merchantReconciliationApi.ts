import type { MerchantEnvelope } from '@type/merchant'
import type {
  ConfirmHandledBody,
  ReconciliationResult,
  ResultsQuery,
  SettlementPause,
  SubBalanceReport
} from '@/pages/merchant-management/merchant-reconciliation/types/reconciliation.types'
import type { CredentialOtpChallenge } from './merchantGatewayApi'
import { apiMerchant } from './apiService'

// BE trả `message` là tên mã lỗi; màn tự hiển thị `detail` nên tắt toast tập trung.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data
const RESULTS_TAG = { type: 'merchant' as const, id: 'reconciliation-results' }
const PAUSES_TAG = { type: 'merchant' as const, id: 'reconciliation-pauses' }

const subUrl = (subId: string, suffix: string) =>
  `/merchant-reconciliations/sub-merchants/${subId}/${suffix}`

export const merchantReconciliationApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getReconciliationResults: builder.query<
      ReconciliationResult[],
      ResultsQuery
    >({
      query: ({ subId, date }) => ({
        url: subUrl(subId, 'results'),
        params: date ? { date } : undefined
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<ReconciliationResult[]>,
      providesTags: [RESULTS_TAG]
    }),
    runReconciliation: builder.mutation<ReconciliationResult, string>({
      query: (subId) => ({ url: subUrl(subId, 'run'), method: 'POST' }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<ReconciliationResult>,
      // Kết quả lệch mở pause mới nên làm mới cả hai danh sách.
      invalidatesTags: [RESULTS_TAG, PAUSES_TAG]
    }),
    getReconciliationPauses: builder.query<SettlementPause[], void>({
      query: () => '/merchant-reconciliations/pauses',
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SettlementPause[]>,
      providesTags: [PAUSES_TAG]
    }),
    challengeConfirmHandledOtp: builder.mutation<
      CredentialOtpChallenge,
      string
    >({
      query: (subId) => ({
        url: subUrl(subId, 'confirm-handled/otp-challenge'),
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<CredentialOtpChallenge>
    }),
    confirmReconciliationHandled: builder.mutation<
      ReconciliationResult,
      { subId: string; body: ConfirmHandledBody }
    >({
      query: ({ subId, body }) => ({
        url: subUrl(subId, 'confirm-handled'),
        method: 'POST',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<ReconciliationResult>,
      // Lần chạy lại được ghi cả khi vẫn lệch (409) nên luôn làm mới.
      invalidatesTags: () => [RESULTS_TAG, PAUSES_TAG]
    }),
    getSubBalanceReport: builder.query<SubBalanceReport, string>({
      query: (subId) => subUrl(subId, 'balance-report'),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SubBalanceReport>
    })
  })
})

export const {
  useGetReconciliationResultsQuery,
  useRunReconciliationMutation,
  useGetReconciliationPausesQuery,
  useChallengeConfirmHandledOtpMutation,
  useConfirmReconciliationHandledMutation,
  useGetSubBalanceReportQuery
} = merchantReconciliationApi
