import {
  DashboardOverviewApiArg,
  DashboardOverviewApiResponse,
  DashboardSendSmsApiArg,
  DashboardSendSmsApiResponse,
  DashboardStatisticApiArg,
  DashboardStatisticApiResponse
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] Admin Dashboard'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      dashboardStatistic: build.query<
        DashboardStatisticApiResponse,
        DashboardStatisticApiArg
      >({
        query: (queryArg) => ({
          url: `/dashboard/statistic`,
          params: { time: queryArg.time }
        }),
        transformResponse(baseQueryReturnValue: any, meta, arg) {
          return baseQueryReturnValue
        },
        providesTags: ['[Admin] Admin Dashboard']
      }),
      dashboardSendSms: build.query<
        DashboardSendSmsApiResponse,
        DashboardSendSmsApiArg
      >({
        query: (queryArg) => ({
          url: `/dashboard/send-sms-metric`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Dashboard']
      }),
      dashboardOverview: build.query<
        DashboardOverviewApiResponse,
        DashboardOverviewApiArg
      >({
        query: (queryArg) => ({
          url: `/dashboard/chart-overview`,
          params: () => {
            return { year: queryArg.year }
          }
        }),
        transformResponse: (response: any) =>
          response.data as Record<string, any>[],
        providesTags: ['[Admin] Admin Dashboard']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useDashboardStatisticQuery,
  useDashboardSendSmsQuery,
  useDashboardOverviewQuery
} = injectedRtkApi
