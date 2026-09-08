import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import { apiWalletCore } from '@services/apiService'
import {
  StuckTransactionOutcome,
  type StuckTransactionUpdateArg,
  type StuckTransactionUpdateResult
} from '@type/stuckTransaction.type'
import { z } from 'zod'

const updateResponseSchema = z.object({
  data: z.object({
    transactionCode: z.string(),
    transactionType: z.string().nullish(),
    previousStatus: z.string().nullish(),
    newStatus: z.string(),
    authCode: z.string().nullish(),
    settlementId: z.string().nullish(),
    note: z.string().nullish(),
    updatedBy: z.string().nullish(),
    updatedAt: z.string().nullish()
  })
})

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
      async queryFn(
        { transactionCode, newStatus, authCode, settlementId, note },
        queryApi,
        extraOptions
      ) {
        // Hai mã đối soát chỉ tồn tại khi chốt thành công; gửi chuỗi rỗng kèm
        // FAILED là gửi rác vào audit log.
        const isSuccess = newStatus === StuckTransactionOutcome.POSTED
        const response = await fetchBaseQueryUserWallet(
          {
            url: `/transactions/${encodeURIComponent(transactionCode)}/update-status`,
            method: 'POST',
            body: {
              newStatus,
              note,
              ...(isSuccess ? { authCode, settlementId } : {})
            }
          },
          queryApi,
          extraOptions
        )

        if (response.error) return { error: response.error }

        const parsedResponse = updateResponseSchema.safeParse(response.data)
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
            authCode: result.authCode ?? null,
            settlementId: result.settlementId ?? null,
            note: result.note ?? null,
            updatedBy: result.updatedBy ?? null,
            updatedAt: result.updatedAt ?? null
          }
        }
      },
      invalidatesTags: (_result, _error, { transactionCode }) => [
        { type: 'Withdrawal' as const, id: transactionCode },
        'Journal' as const
      ]
    })
  })
})

export const { useUpdateStuckTransactionStatusMutation } = apiStuckTransaction
