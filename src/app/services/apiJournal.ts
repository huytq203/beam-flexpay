import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import { apiWalletCore } from '@services/apiService'
import type {
  DataUnifiedJournal,
  TransactionDetail360,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import { PayoutMode } from '@type/withdrawalApproval.type'
import { z } from 'zod'

const withdrawalBeneficiarySchema = z.object({
  bankCode: z.string().nullable(),
  accountNumber: z.string().nullable(),
  accountName: z.string().nullable(),
  branch: z.string().nullable().optional()
})

/**
 * Chỉ `id`, `transactionCode`, `beneficiary` là bắt buộc — phần còn lại để
 * `nullish` có chủ đích: BE bổ sung trường theo đợt, và một bản deploy chưa có
 * `status` không được phép làm hỏng khối thông tin thụ hưởng đang chạy.
 */
const withdrawalDetailResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    transactionCode: z.string(),
    beneficiary: withdrawalBeneficiarySchema.nullish(),
    /** Trạng thái lệnh rút bên user-wallet — xem `@type/withdrawalApproval.type`. */
    status: z.string().nullish(),
    /** Trạng thái bút toán bên wallet-core; KHÁC `status` ở trên. */
    journalStatus: z.string().nullish(),
    amount: z.number().nullish(),
    fee: z.number().nullish(),
    grossAmount: z.number().nullish(),
    /** Lý do lệnh dừng: từ chối duyệt, ngân hàng từ chối, hoặc lỗi chi. */
    failureReason: z.string().nullish(),
    bankRefId: z.string().nullish(),
    processedAt: z.string().nullish(),
    updatedBy: z.string().nullish(),
    updatedAt: z.string().nullish(),
    /** Chế độ chi do BE quyết (`API`/`MANUAL`); FE không tự suy. */
    payoutMode: z.enum(PayoutMode).nullish(),
    /** `true` khi admin phải bấm Chi thành công / Chi thất bại; vắng = không hiện nút. */
    awaitingManualConfirmation: z.boolean().nullish()
  })
})

export type WithdrawalDetail = z.infer<
  typeof withdrawalDetailResponseSchema
>['data']

const unifiedQuery = (params: object) => ({
  url: `/wallet/journal/unified`,
  params,
  method: 'GET' as const
})

const unwrapUnified = (res: { data: DataUnifiedJournal }): DataUnifiedJournal =>
  res.data

export const apiJournal = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    getUnified: build.query<DataUnifiedJournal, object>({
      query: unifiedQuery,
      transformResponse: unwrapUnified,
      providesTags: ['Journal']
    }),
    // Cùng API với `getUnified`; màn Lịch sử giao dịch hiện lỗi inline (TransactionListError)
    // nên tắt toast, còn các màn khác chưa tự báo lỗi vẫn dùng `getUnified`.
    getUnifiedInlineError: build.query<DataUnifiedJournal, object>({
      query: unifiedQuery,
      extraOptions: { suppressErrorNotification: true },
      transformResponse: unwrapUnified,
      providesTags: ['Journal']
    }),
    getUnifiedById: build.query<UnifiedContentJournal, string | undefined>({
      query: (id) => ({
        url: `/wallet/journal/unified/${id}`,
        method: 'GET'
      }),
      transformResponse: (res: { data: UnifiedContentJournal }) => res.data,
      providesTags: ['Journal']
    }),
    getTransactionDetail360: build.query<TransactionDetail360, string>({
      query: (id) => ({
        url: `/wallet/journal/unified/${id}/detail`,
        method: 'GET'
      }),
      transformResponse: (res: { data: TransactionDetail360 }) => res.data,
      providesTags: ['Journal']
    }),
    getWithdrawalByTransactionCode: build.query<WithdrawalDetail, string>({
      async queryFn(transactionCode, queryApi, extraOptions) {
        const response = await fetchBaseQueryUserWallet(
          {
            url: '/withdrawals',
            method: 'GET',
            params: { transactionCode }
          },
          queryApi,
          extraOptions
        )

        if (response.error) return { error: response.error }

        const parsedResponse = withdrawalDetailResponseSchema.safeParse(
          response.data
        )
        if (!parsedResponse.success) {
          return {
            error: {
              status: 'PARSING_ERROR',
              originalStatus: 200,
              data: JSON.stringify(response.data) ?? '',
              error: parsedResponse.error.message
            }
          }
        }

        return { data: parsedResponse.data.data }
      },
      providesTags: (_result, _error, transactionCode) => [
        { type: 'Withdrawal' as const, id: transactionCode },
        'Journal' as const
      ]
    })
  })
})
export const {
  useGetUnifiedQuery,
  useGetUnifiedInlineErrorQuery,
  useGetUnifiedByIdQuery,
  useGetTransactionDetail360Query,
  useGetWithdrawalByTransactionCodeQuery,
  useLazyGetUnifiedByIdQuery,
  useLazyGetWithdrawalByTransactionCodeQuery
} = apiJournal
