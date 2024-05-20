import {
  TransactionFindAllApiArg,
  TransactionFindAllApiResponse,
  TransactionFindOneApiArg,
  TransactionFindOneApiResponse,
  TransactionUpdateStatusApiArg,
  TransactionUpdateStatusApiResponse
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = [
  'Transaction',
  '[Admin] Admin Transaction Limit'
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      transactionFindAll: build.query<
        TransactionFindAllApiResponse,
        TransactionFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            code: queryArg.code,
            referenceId: queryArg.referenceId,
            type: queryArg['type'],
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            accountNumber: queryArg.accountNumber,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['Transaction']
      }),
      transactionFindOne: build.query<
        TransactionFindOneApiResponse,
        TransactionFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/transaction/${queryArg.id}` }),
        providesTags: ['Transaction']
      }),
      transactionUpdateStatus: build.mutation<
        TransactionUpdateStatusApiResponse,
        TransactionUpdateStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction/status/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateTransactionStatusDto
        }),
        invalidatesTags: ['Transaction']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useTransactionFindAllQuery,
  useTransactionFindOneQuery,
  useTransactionUpdateStatusMutation
} = injectedRtkApi
