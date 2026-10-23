import { z } from 'zod'

/** Báo cáo phí đầu vào: tối đa 366 ngày mỗi lần xem để truy vấn không quét quá rộng. */
export const MAX_REPORT_RANGE_DAYS = 366

const DAY_MS = 24 * 60 * 60 * 1000
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

const toUtcDay = (value: string): number => {
  const [y, m, d] = value.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export const inputCostReportFilterSchema = z
  .object({
    from: z
      .string({ error: 'Vui lòng chọn ngày bắt đầu' })
      .regex(DATE_ONLY, 'Vui lòng chọn ngày bắt đầu'),
    to: z
      .string({ error: 'Vui lòng chọn ngày kết thúc' })
      .regex(DATE_ONLY, 'Vui lòng chọn ngày kết thúc'),
    providerCode: z.string().optional(),
    bankCode: z.string().optional(),
    serviceType: z.string().optional(),
    paymentMethod: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (!DATE_ONLY.test(value.from) || !DATE_ONLY.test(value.to)) return
    const days = (toUtcDay(value.to) - toUtcDay(value.from)) / DAY_MS
    if (days < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: 'Từ ngày phải nhỏ hơn hoặc bằng Đến ngày'
      })
    } else if (days + 1 > MAX_REPORT_RANGE_DAYS) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: `Khoảng thời gian tối đa ${MAX_REPORT_RANGE_DAYS} ngày`
      })
    }
  })

export type InputCostReportFilters = z.infer<
  typeof inputCostReportFilterSchema
>

/** Query gửi backend: bỏ ô trống, không gửi chuỗi rỗng. */
export const toInputCostReportParams = (
  filters: InputCostReportFilters
): Record<string, string> => {
  const entries = Object.entries(filters).filter(
    ([, value]) => typeof value === 'string' && value.trim() !== ''
  )
  return Object.fromEntries(entries) as Record<string, string>
}

const moneySchema = z.number()

export const inputCostReportComponentSchema = z.object({
  componentType: z.string(),
  calculatedFee: moneySchema,
  beneficiaryType: z.string().nullish()
})

export const inputCostReportRowSchema = z.object({
  feeCalculationId: z.string(),
  feeCode: z.string().nullish(),
  operationId: z.string().nullish(),
  issuedAt: z.string(),
  serviceType: z.string(),
  providerCode: z.string().nullish(),
  bankCode: z.string().nullish(),
  paymentMethod: z.string().nullish(),
  transactionAmount: moneySchema,
  customerFee: moneySchema,
  inputCost: moneySchema,
  margin: moneySchema,
  inputCostPolicyId: z.string().nullish(),
  inputCostPolicyName: z.string().nullish(),
  components: z.array(inputCostReportComponentSchema).default([])
})

export const inputCostReportTotalsSchema = z.object({
  transactionCount: z.number(),
  totalAmount: moneySchema,
  totalCustomerFee: moneySchema,
  totalInputCost: moneySchema,
  margin: moneySchema
})

export const inputCostReportGroupSchema = inputCostReportTotalsSchema.extend({
  providerCode: z.string().nullish(),
  bankCode: z.string().nullish(),
  serviceType: z.string()
})

export const inputCostReportSummarySchema = z.object({
  groups: z.array(inputCostReportGroupSchema),
  totals: inputCostReportTotalsSchema
})

export type InputCostReportComponent = z.infer<
  typeof inputCostReportComponentSchema
>
export type InputCostReportRow = z.infer<typeof inputCostReportRowSchema>
export type InputCostReportTotals = z.infer<typeof inputCostReportTotalsSchema>
export type InputCostReportGroup = z.infer<typeof inputCostReportGroupSchema>
export type InputCostReportSummary = z.infer<
  typeof inputCostReportSummarySchema
>
