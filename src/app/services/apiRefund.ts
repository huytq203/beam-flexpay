import { apiUserWallet } from '@services/apiService'
import type {
  CreateRefundRequest,
  RefundChannel,
  RefundDetail,
  RefundPage,
  RefundSource,
  RefundStatus
} from '@pages/transaction-management/refund-management/schemas/refund.schema'

interface RefundEnvelope<T> {
  data: T
}

export interface RefundListParams {
  page: number
  size: number
  sort?: string
  keyword?: string
  customerPhone?: string
  status?: RefundStatus
  channel?: RefundChannel
  createdSource?: RefundSource
  createdFrom?: string
  createdTo?: string
}

export interface RejectRefundArg {
  id: string
  reason: string
}

export interface SettleRefundArg {
  id: string
  success: boolean
  failureReason?: string
}

const REFUNDS_URL = '/refunds'
const LIST_TAG = { type: 'Refund' as const, id: 'LIST' }
const refundTag = (id: string) => ({ type: 'Refund' as const, id })

/**
 * `fetchBaseQueryCustom` chỉ hiện `message` (tên enum như BUSINESS_ERROR) cho lỗi 4xx.
 * Hoàn tiền cần câu tiếng Việt ở `detail`, nên tắt toast đó và để màn tự hiển thị
 * (toast của `errorMiddleware` cũng tắt, và 403 hiện tại chỗ thay vì sang /forbidden:
 * xem SILENT_ENDPOINTS và LOCAL_403_ENDPOINTS).
 */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

const unwrap = <T>(response: RefundEnvelope<T>): T => response.data

export const apiRefund = apiUserWallet.injectEndpoints({
  endpoints: (build) => ({
    getRefunds: build.query<RefundPage, RefundListParams>({
      query: (params) => ({ url: REFUNDS_URL, method: 'GET', params }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (response: RefundEnvelope<RefundPage>) =>
        unwrap(response),
      providesTags: (result) => [
        LIST_TAG,
        ...(result?.content ?? []).map((item) => refundTag(item.id))
      ]
    }),
    getRefundDetail: build.query<RefundDetail, string>({
      query: (id) => ({
        url: `${REFUNDS_URL}/${encodeURIComponent(id)}`,
        method: 'GET'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (response: RefundEnvelope<RefundDetail>) =>
        unwrap(response),
      providesTags: (_result, _error, id) => [refundTag(id)]
    }),
    createRefund: build.mutation<RefundDetail, CreateRefundRequest>({
      query: (body) => ({ url: REFUNDS_URL, method: 'POST', body }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (response: RefundEnvelope<RefundDetail>) =>
        unwrap(response),
      invalidatesTags: [LIST_TAG]
    }),
    approveRefund: build.mutation<RefundDetail, string>({
      query: (id) => ({
        url: `${REFUNDS_URL}/${encodeURIComponent(id)}/approve`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (response: RefundEnvelope<RefundDetail>) =>
        unwrap(response),
      // Duyệt lỗi giữa chừng vẫn ghi failureReason lên BE nên làm mới cả khi thất bại.
      invalidatesTags: (_result, _error, id) => [refundTag(id), LIST_TAG]
    }),
    rejectRefund: build.mutation<RefundDetail, RejectRefundArg>({
      query: ({ id, reason }) => ({
        url: `${REFUNDS_URL}/${encodeURIComponent(id)}/reject`,
        method: 'POST',
        body: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (response: RefundEnvelope<RefundDetail>) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => [refundTag(id), LIST_TAG]
    }),
    settleRefund: build.mutation<RefundDetail, SettleRefundArg>({
      query: ({ id, success, failureReason }) => ({
        url: `${REFUNDS_URL}/${encodeURIComponent(id)}/settle`,
        method: 'POST',
        body: { success, failureReason: success ? null : failureReason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (response: RefundEnvelope<RefundDetail>) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => [refundTag(id), LIST_TAG]
    }),
    refreshRefundPayout: build.mutation<RefundDetail, string>({
      query: (id) => ({
        url: `${REFUNDS_URL}/${encodeURIComponent(id)}/payout/refresh`,
        method: 'POST'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (response: RefundEnvelope<RefundDetail>) =>
        unwrap(response),
      invalidatesTags: (_result, _error, id) => [refundTag(id), LIST_TAG]
    })
  })
})

export const {
  useGetRefundsQuery,
  useGetRefundDetailQuery,
  useCreateRefundMutation,
  useApproveRefundMutation,
  useRejectRefundMutation,
  useSettleRefundMutation,
  useRefreshRefundPayoutMutation
} = apiRefund
