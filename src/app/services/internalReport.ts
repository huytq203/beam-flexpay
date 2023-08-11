import { apiService } from './apiService'

export const internalReportApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getAccountChartData: builder.query({
      query: (payload) => ({
        url: `/report/account`,
        method: 'GET',
        params: {
          reportType: payload
        }
      })
    }),
    getReportData: builder.query({
      query: (payload) => ({
        url: `/report`,
        method: 'GET',
        params: payload
      })
    }),
    getDeviceChartData: builder.query({
      query: () => ({
        url: `/report/device`,
        method: 'GET'
      })
    }),
    getProvincesChartData: builder.query({
      query: () => ({
        url: `/report/provinces`,
        method: 'GET'
      })
    })
  })
})

export const {
  useGetAccountChartDataQuery,
  useGetReportDataQuery,
  useGetDeviceChartDataQuery,
  useGetProvincesChartDataQuery,
  useLazyGetReportDataQuery
} = internalReportApi
