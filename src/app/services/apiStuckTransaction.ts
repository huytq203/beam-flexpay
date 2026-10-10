import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import { apiWalletCore } from '@services/apiService'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type {
  StuckReceiptLink,
  StuckReceiptUploadArg,
  StuckReceiptUploadResult,
  StuckTransactionUpdateArg,
  StuckTransactionUpdateResult
} from '@type/stuckTransaction.type'
import { z } from 'zod'

const updateResponseSchema = z.object({
  success: z.boolean(),
  detail: z.string().optional(),
  data: z.object({
    transactionCode: z.string(),
    transactionType: z.string().nullish(),
    previousStatus: z.string().nullish(),
    newStatus: z.string(),
    requestId: z.string().nullish(),
    journalId: z.string().nullish(),
    transactionId: z.string().nullish(),
    authCode: z.string().nullish(),
    settlementId: z.string().nullish(),
    bankReference: z.string().nullish(),
    receiptKey: z.string().nullish(),
    refundBankReference: z.string().nullish(),
    note: z.string().nullish(),
    updatedBy: z.string().nullish(),
    updatedAt: z.string().nullish(),
    refundCode: z.string().nullish(),
    displayStatus: z.string().nullish()
  })
})

const uploadResponseSchema = z.object({
  data: z.object({
    receiptKey: z.string(),
    contentType: z.string().nullish(),
    sizeBytes: z.number().nullish()
  })
})

/** `data` là `{}` khi giao dịch chưa có biên lai. */
const receiptLinkResponseSchema = z.object({
  data: z.object({ receiptUrl: z.string().nullish() }).nullish()
})

/**
 * Màn tự hiện `detail` của BE ngay trong form (kể cả 400 "chưa cấu hình lưu biên lai"),
 * nên tắt toast chung của endpoint mới.
 */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

const receiptUrl = (transactionCode: string): string =>
  `/transactions/${encodeURIComponent(transactionCode)}/receipt`

const parsingError = (raw: unknown, message: string): FetchBaseQueryError => ({
  status: 'PARSING_ERROR',
  originalStatus: 200,
  data: JSON.stringify(raw) ?? '',
  error: message
})

/** Bỏ trường rỗng để BE không nhận chuỗi trống ở các mã không bắt buộc. */
const toUpdateBody = (
  arg: Omit<StuckTransactionUpdateArg, 'transactionCode'>
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(arg).filter(
      ([, value]) => value !== undefined && value !== ''
    )
  )

/**
 * Chốt kết quả cuối cho giao dịch treo (nạp / rút / chuyển đã gửi sang ngân
 * hàng nhưng chưa có kết quả).
 *
 * Inject vào `apiWalletCore` như `apiWithdrawalApproval` để lệnh này invalidate
 * được cả bút toán bên wallet-core lẫn bản ghi lệnh bên user-wallet — hai kho
 * cache tách nhau thì màn chi tiết sẽ hiện số dư và trạng thái cũ sau khi ghi sổ.
 */
export const apiStuckTransaction = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    updateStuckTransactionStatus: build.mutation<
      StuckTransactionUpdateResult,
      StuckTransactionUpdateArg
    >({
      async queryFn({ transactionCode, ...arg }, queryApi, extraOptions) {
        const response = await fetchBaseQueryUserWallet(
          {
            url: `/transactions/${encodeURIComponent(transactionCode)}/update-status`,
            method: 'POST',
            body: toUpdateBody(arg)
          },
          queryApi,
          extraOptions
        )

        if (response.error) return { error: response.error }

        const parsedResponse = updateResponseSchema.safeParse(response.data)
        if (
          response.data &&
          typeof response.data === 'object' &&
          'success' in response.data &&
          response.data.success === false
        ) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'BUSINESS_ERROR',
              data: response.data
            }
          }
        }
        if (!parsedResponse.success) {
          return {
            error: {
              status: 'PARSING_ERROR' as const,
              originalStatus: 200,
              data: JSON.stringify(response.data) ?? '',
              error: parsedResponse.error.message
            }
          }
        }

        const result = parsedResponse.data.data
        return {
          data: {
            transactionCode: result.transactionCode,
            transactionType: result.transactionType ?? null,
            previousStatus: result.previousStatus ?? null,
            newStatus: result.newStatus,
            requestId: result.requestId ?? null,
            journalId: result.journalId ?? null,
            transactionId: result.transactionId ?? null,
            authCode: result.authCode ?? null,
            settlementId: result.settlementId ?? null,
            bankReference: result.bankReference ?? null,
            receiptKey: result.receiptKey ?? null,
            refundBankReference: result.refundBankReference ?? null,
            note: result.note ?? null,
            updatedBy: result.updatedBy ?? null,
            updatedAt: result.updatedAt ?? null,
            refundCode: result.refundCode ?? null,
            displayStatus: result.displayStatus ?? null
          }
        }
      },
      invalidatesTags: (_result, _error, { transactionCode }) => [
        { type: 'Withdrawal' as const, id: transactionCode },
        'Journal' as const,
        'historyTransaction' as const
      ]
    }),
    /** Gửi `multipart/form-data` (một phần `file`); không đặt Content-Type để trình duyệt tự thêm boundary. */
    uploadStuckTransactionReceipt: build.mutation<
      StuckReceiptUploadResult,
      StuckReceiptUploadArg
    >({
      async queryFn({ transactionCode, file }, queryApi, extraOptions) {
        const body = new FormData()
        body.append('file', file)
        const response = await fetchBaseQueryUserWallet(
          { url: receiptUrl(transactionCode), method: 'POST', body },
          queryApi,
          extraOptions
        )
        if (response.error) return { error: response.error }
        const parsed = uploadResponseSchema.safeParse(response.data)
        if (!parsed.success) {
          return { error: parsingError(response.data, parsed.error.message) }
        }
        const { receiptKey, contentType, sizeBytes } = parsed.data.data
        return {
          data: {
            receiptKey,
            contentType: contentType ?? null,
            sizeBytes: sizeBytes ?? null
          }
        }
      },
      extraOptions: OWN_ERROR_HANDLING
    }),
    /** Link S3 hết hạn sau ~5 phút nên không giữ cache: mỗi lần bấm xem là một lần gọi mới. */
    getStuckTransactionReceipt: build.query<StuckReceiptLink, string>({
      async queryFn(transactionCode, queryApi, extraOptions) {
        const response = await fetchBaseQueryUserWallet(
          { url: receiptUrl(transactionCode), method: 'GET' },
          queryApi,
          extraOptions
        )
        if (response.error) return { error: response.error }
        const parsed = receiptLinkResponseSchema.safeParse(response.data)
        if (!parsed.success) {
          return { error: parsingError(response.data, parsed.error.message) }
        }
        return {
          data: { receiptUrl: parsed.data.data?.receiptUrl ?? null }
        }
      },
      keepUnusedDataFor: 0,
      extraOptions: OWN_ERROR_HANDLING
    })
  })
})

export const {
  useUpdateStuckTransactionStatusMutation,
  useUploadStuckTransactionReceiptMutation,
  useLazyGetStuckTransactionReceiptQuery
} = apiStuckTransaction
