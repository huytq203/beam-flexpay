import { baseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import { apiWalletCore } from '@services/apiService'
import type {
  DataUnifiedJournal,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import { z } from 'zod'

const withdrawalBeneficiarySchema = z.object({
  bankCode: z.string().nullable(),
  accountNumber: z.string().nullable(),
  accountName: z.string().nullable(),
  branch: z.string().nullable().optional()
})

const withdrawalDetailResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    transactionCode: z.string(),
    beneficiary: withdrawalBeneficiarySchema.nullable()
  })
})

export type WithdrawalDetail = z.infer<
  typeof withdrawalDetailResponseSchema
>['data']

export const apiJournal = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
      getUnified: build.query<DataUnifiedJournal, object>({
        query: (params) => ({
          url: `/wallet/journal/unified`,
          params: params,
          method: 'GET'
        }),
        transformResponse: (res: { data: DataUnifiedJournal }) => res.data,
        providesTags: ['Journal'],
      }),
      getUnifiedById: build.query<UnifiedContentJournal, string | undefined>({
        query: (id) => ({
          url: `/wallet/journal/unified/${id}`,
          method: 'GET'
        }),
        transformResponse: (res: { data: UnifiedContentJournal }) => res.data,
        providesTags: ['Journal'],
      }),
      getWithdrawalByTransactionCode: build.query<WithdrawalDetail, string>({
        async queryFn(transactionCode, queryApi, extraOptions) {
          const response = await baseQueryUserWallet(
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
        providesTags: ['Journal']
      })
    })
})
export const {
  useGetUnifiedQuery,
  useGetUnifiedByIdQuery,
  useGetWithdrawalByTransactionCodeQuery,
  useLazyGetUnifiedByIdQuery,
  useLazyGetWithdrawalByTransactionCodeQuery,
} = apiJournal
