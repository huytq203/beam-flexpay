import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { apiWalletCore } from '@services/apiService'
import type { BankConfirmation } from '@type/stuckTransaction.type'
import type { z } from 'zod'
import {
  transactionReviewEnvelopeSchema,
  transactionSnapshotEnvelopeSchema,
  type ReviewRejectOption,
  type TransactionReviewResult,
  type TransactionSnapshot
} from '@/app/schemas/transaction-review.schema'

export interface MarkReviewArg {
  transactionCode: string
  reason: string
}

export interface ApproveReviewArg {
  transactionCode: string
  authCode: string
  settlementId: string
  note?: string
  bankConfirmation?: BankConfirmation
}

export interface RejectReviewArg {
  transactionCode: string
  option: ReviewRejectOption
  reason: string
  refundAuthCode?: string
  refundSettlementId?: string
  bankConfirmation?: BankConfirmation
}

type UserWalletQuery = typeof fetchBaseQueryUserWallet
type QueryApi = Parameters<UserWalletQuery>[1]
type ExtraOptions = Parameters<UserWalletQuery>[2]
type Outcome<T> = { data: T } | { error: FetchBaseQueryError }

/**
 * Màn tự hiện `detail` tiếng Việt của BE ngay trong hộp thoại, nên tắt toast chung
 * (toast của `errorMiddleware` cũng tắt, và 403 hiện tại chỗ thay vì sang /forbidden:
 * xem SILENT_ENDPOINTS và LOCAL_403_ENDPOINTS).
 */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

const transactionUrl = (transactionCode: string, suffix: string): string =>
  `/transactions/${encodeURIComponent(transactionCode)}/${suffix}`

const parsingError = (raw: unknown, message: string): FetchBaseQueryError => ({
  status: 'PARSING_ERROR',
  originalStatus: 200,
  data: JSON.stringify(raw) ?? '',
  error: message
})

const isBusinessFailure = (raw: unknown): boolean =>
  typeof raw === 'object' &&
  raw !== null &&
  'success' in raw &&
  raw.success === false

/** Gọi user-wallet, báo lỗi nghiệp vụ 200/`success=false` như lỗi và kiểm tra hình dạng response. */
const post = async <S extends z.ZodType<{ data: unknown }>>(
  schema: S,
  url: string,
  body: object | undefined,
  queryApi: QueryApi,
  extraOptions: ExtraOptions
): Promise<Outcome<z.infer<S>['data']>> => {
  const response = await fetchBaseQueryUserWallet(
    { url, method: 'POST', ...(body ? { body } : {}) },
    queryApi,
    extraOptions
  )
  if (response.error) return { error: response.error }
  if (isBusinessFailure(response.data)) {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: 'BUSINESS_ERROR',
        data: response.data
      }
    }
  }
  const parsed = schema.safeParse(response.data)
  if (!parsed.success) {
    return { error: parsingError(response.data, parsed.error.message) }
  }
  return { data: parsed.data.data }
}

/** Chỉ bút toán và lịch sử giao dịch đổi; lệnh rút (`Withdrawal`) không liên quan lệnh nạp. */
const REVIEW_TAGS = ['Journal', 'historyTransaction'] as const

/**
 * Review lệnh nạp của user-wallet. Inject vào `apiWalletCore` như
 * `apiStuckTransaction`: duyệt/từ chối ghi sổ hoặc nhả khoản giữ nên phải làm mới
 * cache bút toán của wallet-core.
 */
export const apiTransactionReview = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    /** Không phải truy vấn thuần (BE có thể hỏi lại ngân hàng) nên là mutation. */
    refreshTransaction: build.mutation<TransactionSnapshot, string>({
      queryFn: (transactionCode, queryApi, extraOptions) =>
        post(
          transactionSnapshotEnvelopeSchema,
          transactionUrl(transactionCode, 'refresh'),
          undefined,
          queryApi,
          extraOptions
        ),
      extraOptions: OWN_ERROR_HANDLING
    }),
    markTransactionReview: build.mutation<
      TransactionReviewResult,
      MarkReviewArg
    >({
      queryFn: ({ transactionCode, reason }, queryApi, extraOptions) =>
        post(
          transactionReviewEnvelopeSchema,
          transactionUrl(transactionCode, 'review'),
          { reason },
          queryApi,
          extraOptions
        ),
      extraOptions: OWN_ERROR_HANDLING
    }),
    approveTransactionReview: build.mutation<
      TransactionReviewResult,
      ApproveReviewArg
    >({
      queryFn: ({ transactionCode, ...body }, queryApi, extraOptions) =>
        post(
          transactionReviewEnvelopeSchema,
          transactionUrl(transactionCode, 'review/approve'),
          body,
          queryApi,
          extraOptions
        ),
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: [...REVIEW_TAGS]
    }),
    rejectTransactionReview: build.mutation<
      TransactionReviewResult,
      RejectReviewArg
    >({
      queryFn: ({ transactionCode, ...body }, queryApi, extraOptions) =>
        post(
          transactionReviewEnvelopeSchema,
          transactionUrl(transactionCode, 'review/reject'),
          body,
          queryApi,
          extraOptions
        ),
      extraOptions: OWN_ERROR_HANDLING,
      invalidatesTags: [...REVIEW_TAGS]
    })
  })
})

export const {
  useRefreshTransactionMutation,
  useMarkTransactionReviewMutation,
  useApproveTransactionReviewMutation,
  useRejectTransactionReviewMutation
} = apiTransactionReview
