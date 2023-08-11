import {
  ReportGetMetricAccountRegisterApiArg,
  ReportGetMetricAccountRegisterApiResponse,
  ReportGetMetricDeviceApiArg,
  ReportGetMetricDeviceApiResponse,
  ReportGetMetricOfAccountApiArg,
  ReportGetMetricOfAccountApiResponse,
  ReportGetMetricProvinceApiArg,
  ReportGetMetricProvinceApiResponse
} from '@type/application'
import { apiService as api } from './apiService'
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
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useReportGetMetricOfAccountQuery,
  useReportGetMetricAccountRegisterQuery,
  useReportGetMetricDeviceQuery,
  useReportGetMetricProvinceQuery
} = injectedRtkApi
