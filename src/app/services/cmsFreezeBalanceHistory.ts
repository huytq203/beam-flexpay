import {
  FreezeBalanceHistoryCreateApiArg,
  FreezeBalanceHistoryCreateApiResponse,
  FreezeBalanceHistoryFindAllApiArg,
  FreezeBalanceHistoryFindAllApiResponse,
  FreezeBalanceHistoryOpenFreezeBalanceApiArg,
  FreezeBalanceHistoryOpenFreezeBalanceApiResponse
} from '@type/application'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] Admin Freeze Money History'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      freezeBalanceHistoryCreate: build.mutation<
        FreezeBalanceHistoryCreateApiResponse,
        FreezeBalanceHistoryCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/freeze-balance-history`,
          method: 'POST',
          body: queryArg.createFreezeBalanceHistoryDto
        }),
        invalidatesTags: ['[Admin] Admin Freeze Money History']
      }),
      freezeBalanceHistoryFindAll: build.query<
        FreezeBalanceHistoryFindAllApiResponse,
        FreezeBalanceHistoryFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/freeze-balance-history`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            customerAccountNumber: queryArg.customerAccountNumber,
            status: queryArg.status,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Freeze Money History']
      }),
      freezeBalanceHistoryOpenFreezeBalance: build.mutation<
        FreezeBalanceHistoryOpenFreezeBalanceApiResponse,
        FreezeBalanceHistoryOpenFreezeBalanceApiArg
      >({
        query: (queryArg) => ({
          url: `/freeze-balance-history/open-freeze-balance`,
          method: 'POST',
          body: queryArg.openFreezeBalanceHistoryDto
        }),
        invalidatesTags: ['[Admin] Admin Freeze Money History']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useFreezeBalanceHistoryCreateMutation,
  useFreezeBalanceHistoryFindAllQuery,
  useFreezeBalanceHistoryOpenFreezeBalanceMutation
} = injectedRtkApi
