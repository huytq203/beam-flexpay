import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import { apiWalletCore } from '@services/apiService'
import type {
  WithdrawalApproveArg,
  WithdrawalDecisionResult,
  WithdrawalRejectArg
} from '@type/withdrawalApproval.type'
import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import { z } from 'zod'

/**
 * Hai endpoint duyệt lệnh rút vượt ngưỡng nằm ở service **user-wallet**, còn
 * chi tiết giao dịch nằm ở **wallet-core**. Chúng được inject vào cùng
 * `apiWalletCore` (qua `queryFn` + base query riêng, đúng lối
 * `getWithdrawalByTransactionCode` đang dùng) để một lệnh duyệt invalidate được
 * cả tag `Withdrawal` lẫn `Journal` — nếu tách `createApi` mới thì hai kho cache
 * không nói chuyện được với nhau và màn chi tiết sẽ hiển thị dữ liệu cũ.
 */
const decisionResponseSchema = z.object({
  data: z.object({
    transactionCode: z.string(),
    previousStatus: z.string(),
    newStatus: z.string(),
    grossAmount: z.number().nullish(),
    amount: z.number().nullish(),
    fee: z.number().nullish(),
    note: z.string().nullish(),
    rejectedReason: z.string().nullish(),
    updatedBy: z.string().nullish(),
    updatedAt: z.string().nullish()
  })
})

const toDecisionResult = (
  parsed: z.infer<typeof decisionResponseSchema>['data']
): WithdrawalDecisionResult => ({
  transactionCode: parsed.transactionCode,
  previousStatus: parsed.previousStatus,
  newStatus: parsed.newStatus,
  grossAmount: parsed.grossAmount ?? null,
  amount: parsed.amount ?? null,
  fee: parsed.fee ?? null,
  note: parsed.note ?? null,
  rejectedReason: parsed.rejectedReason ?? null,
  updatedBy: parsed.updatedBy ?? null,
  updatedAt: parsed.updatedAt ?? null
})

const postDecision = async (
  path: string,
  body: Record<string, string>,
  queryApi: BaseQueryApi,
  extraOptions: object
) => {
  const response = await fetchBaseQueryUserWallet(
    { url: path, method: 'POST', body },
    queryApi,
    extraOptions
  )

  if (response.error) return { error: response.error }

  const parsedResponse = decisionResponseSchema.safeParse(response.data)
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

  return { data: toDecisionResult(parsedResponse.data.data) }
}

/** Lệnh duyệt/từ chối làm đổi cả trạng thái lệnh rút lẫn bút toán của nó. */
const decisionTags = (transactionCode: string) => [
  { type: 'Withdrawal' as const, id: transactionCode },
  'Journal' as const
]

export const apiWithdrawalApproval = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    approveWithdrawal: build.mutation<
      WithdrawalDecisionResult,
      WithdrawalApproveArg
    >({
      queryFn: ({ transactionCode, note }, queryApi, extraOptions) =>
        postDecision(
          `/withdrawals/${encodeURIComponent(transactionCode)}/approve`,
          { note },
          queryApi,
          extraOptions
        ),
      invalidatesTags: (_result, _error, { transactionCode }) =>
        decisionTags(transactionCode)
    }),
    rejectWithdrawal: build.mutation<
      WithdrawalDecisionResult,
      WithdrawalRejectArg
    >({
      queryFn: ({ transactionCode, reason }, queryApi, extraOptions) =>
        postDecision(
          `/withdrawals/${encodeURIComponent(transactionCode)}/reject`,
          { reason },
          queryApi,
          extraOptions
        ),
      invalidatesTags: (_result, _error, { transactionCode }) =>
        decisionTags(transactionCode)
    })
  })
})

export const { useApproveWithdrawalMutation, useRejectWithdrawalMutation } =
  apiWithdrawalApproval
