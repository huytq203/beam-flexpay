import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { apiWalletCore } from '@services/apiService'
import {
  transactionSnapshotEnvelopeSchema,
  type TransactionSnapshot
} from '@/app/schemas/transaction-snapshot.schema'

/**
 * Màn tự hiện `detail` tiếng Việt của BE ngay trong hộp thoại, nên tắt toast chung
 * (toast của `errorMiddleware` cũng tắt, và 403 hiện tại chỗ thay vì sang /forbidden:
 * xem SILENT_ENDPOINTS và LOCAL_403_ENDPOINTS).
 */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

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

/**
 * Snapshot giao dịch treo của user-wallet (`POST /transactions/{code}/refresh`).
 * Inject vào `apiWalletCore` như `apiStuckTransaction`.
 */
export const apiTransactionSnapshot = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    /** Không phải truy vấn thuần (BE có thể hỏi lại ngân hàng) nên là mutation. */
    refreshTransaction: build.mutation<TransactionSnapshot, string>({
      queryFn: async (transactionCode, queryApi, extraOptions) => {
        const response = await fetchBaseQueryUserWallet(
          {
            url: `/transactions/${encodeURIComponent(transactionCode)}/refresh`,
            method: 'POST'
          },
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
        const parsed = transactionSnapshotEnvelopeSchema.safeParse(
          response.data
        )
        if (!parsed.success) {
          return { error: parsingError(response.data, parsed.error.message) }
        }
        return { data: parsed.data.data }
      },
      extraOptions: OWN_ERROR_HANDLING
    })
  })
})

export const { useRefreshTransactionMutation } = apiTransactionSnapshot
