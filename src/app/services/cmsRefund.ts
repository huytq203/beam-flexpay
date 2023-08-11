import {
  RefundFindOneApiArg,
  RefundFindOneApiResponse,
  RefundGetExportCsvApiArg,
  RefundGetExportCsvApiResponse,
  RefundGetRefundMoneyApiArg,
  RefundGetRefundMoneyApiResponse,
  RefundRefundApiArg,
  RefundRefundApiResponse
} from '@type/application'
import { apiService as api } from './apiService'
export const addTagTypes = ['Refund'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      refundGetRefundMoney: build.query<
        RefundGetRefundMoneyApiResponse,
        RefundGetRefundMoneyApiArg
      >({
        query: (queryArg) => ({
          url: `/api/admin/refund`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            code: queryArg.code,
            merchantAccount: queryArg.merchantAccount,
            merchant: queryArg.merchant,
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['Refund']
      }),
      refundFindOne: build.query<RefundFindOneApiResponse, RefundFindOneApiArg>(
        {
          query: (queryArg) => ({ url: `/api/admin/refund/${queryArg.id}` }),
          providesTags: ['Refund']
        }
      ),
      refundRefund: build.mutation<RefundRefundApiResponse, RefundRefundApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/admin/refund/refund/${queryArg.id}`,
            method: 'POST'
          }),
          invalidatesTags: ['Refund']
        }
      ),
      refundGetExportCsv: build.query<
        RefundGetExportCsvApiResponse,
        RefundGetExportCsvApiArg
      >({
        query: (queryArg) => ({
          url: `/api/admin/refund/export/csv`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            code: queryArg.code,
            merchantAccount: queryArg.merchantAccount,
            merchant: queryArg.merchant,
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['Refund']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useRefundGetRefundMoneyQuery,
  useRefundFindOneQuery,
  useRefundRefundMutation,
  useRefundGetExportCsvQuery
} = injectedRtkApi
