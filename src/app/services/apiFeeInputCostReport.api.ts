import type { ResponseType } from '@type/api'
import type { FeePage } from '@type/fee.type'
import {
  inputCostReportRowSchema,
  inputCostReportSummarySchema,
  toInputCostReportParams,
  type InputCostReportFilters,
  type InputCostReportRow,
  type InputCostReportSummary
} from '@/app/schemas/fee-input-cost-report.schema'
import { apiFeeService } from './apiService'

export interface InputCostReportTransactionsArg {
  filters: InputCostReportFilters
  /** Bắt đầu từ 1, giống các API danh sách khác của dịch vụ phí. */
  page: number
  size: number
}

/** Báo cáo chỉ đọc: không ghi sổ, không có mutation. */
export const feeInputCostReportApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getInputCostReportSummary: build.query<
      InputCostReportSummary,
      InputCostReportFilters
    >({
      query: (filters) => ({
        url: '/fee/input-cost-report/summary',
        method: 'GET',
        params: toInputCostReportParams(filters)
      }),
      transformResponse: (res: ResponseType<unknown>) =>
        inputCostReportSummarySchema.parse(res.data)
    }),
    getInputCostReportTransactions: build.query<
      FeePage<InputCostReportRow>,
      InputCostReportTransactionsArg
    >({
      query: ({ filters, page, size }) => ({
        url: '/fee/input-cost-report/transactions',
        method: 'GET',
        params: { ...toInputCostReportParams(filters), page, size }
      }),
      transformResponse: (res: ResponseType<FeePage<unknown>>) => ({
        ...res.data,
        content: res.data.content.map((row) =>
          inputCostReportRowSchema.parse(row)
        )
      })
    })
  })
})

export const {
  useGetInputCostReportSummaryQuery,
  useGetInputCostReportTransactionsQuery
} = feeInputCostReportApi
