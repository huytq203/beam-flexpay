import {
  ReportGetMetricAccountRegisterApiArg,
  ReportGetMetricAccountRegisterApiResponse,
  ReportGetMetricDeviceApiArg,
  ReportGetMetricDeviceApiResponse,
  ReportGetMetricOfAccountApiArg,
  ReportGetMetricOfAccountApiResponse,
  ReportGetMetricProvinceApiArg,
  ReportGetMetricProvinceApiResponse,
  ReportGetStateBankOverviewApiResponse,
  ReportGetStateBankOverviewApiArg
} from '@type/application'
import { apiService as api } from './apiService'
import { CustomerTableReport, IStateBank } from '@type/report'
import { ResponseType } from '@type/api'
import { fnTransformResponse } from '@utils/helperFunctions'
export const addTagTypes = ['[Admin] Admin Report'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      reportGetMetricOfAccount: build.query<
        ReportGetMetricOfAccountApiResponse,
        ReportGetMetricOfAccountApiArg
      >({
        query: (queryArg) => ({
          url: `/report/account`,
          params: { reportType: queryArg.reportType }
        }),
        providesTags: ['[Admin] Admin Report']
      }),
      reportGetMetricAccountRegister: build.query<
        ReportGetMetricAccountRegisterApiResponse,
        ReportGetMetricAccountRegisterApiArg
      >({
        query: (queryArg) => ({
          url: `/report`,
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
        providesTags: ['[Admin] Admin Report']
      }),
      reportGetMetricDevice: build.query<
        ReportGetMetricDeviceApiResponse,
        ReportGetMetricDeviceApiArg
      >({
        query: () => ({ url: `/report/device` }),
        providesTags: ['[Admin] Admin Report']
      }),
      reportGetMetricProvince: build.query<
        ReportGetMetricProvinceApiResponse,
        ReportGetMetricProvinceApiArg
      >({
        query: (queryArg) => ({
          url: `/report/provinces`,
          params: { order: queryArg.order, take: queryArg.take }
        }),
        providesTags: ['[Admin] Admin Report']
      }),
      reportGetStateBankOverview: build.query({
        query: (queryArg) => ({
          url: `/report/state-bank`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy,
            name: queryArg.name,
            email: queryArg.email,
            phoneNumber: queryArg.phone,
            status: queryArg.status,
            type: queryArg.type,
            linkBank: queryArg.linkBank
          }
        }),
        transformResponse: (response: ResponseType<IStateBank<[CustomerTableReport]>>) => response.data,
        providesTags: ['[Admin] Admin Report']
      }),
      reportGetStateBankOverviewDetail: build.query({
        query: (queryArg) => {
          // In ra giá trị của queryArg?.id để debug
          console.log('queryArg.id:', queryArg);
          return {
            url: `/report/state-bank/${queryArg}`
          };
        },
        providesTags: ['[Admin] Admin Report'],
        transformResponse: fnTransformResponse
      }),
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useReportGetMetricOfAccountQuery,
  useReportGetMetricAccountRegisterQuery,
  useReportGetMetricDeviceQuery,
  useReportGetMetricProvinceQuery,
  useReportGetStateBankOverviewQuery,
  useReportGetStateBankOverviewDetailQuery
} = injectedRtkApi
