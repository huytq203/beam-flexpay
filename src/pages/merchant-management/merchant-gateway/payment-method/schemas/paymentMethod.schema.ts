import { z } from 'zod'

import type {
  PaymentMethodChannel,
  PaymentMethodCode,
  PaymentMethodScope,
  PaymentMethodStatus
} from '../types/paymentMethod.type'

const scopeSchema = z.enum(['MASTER', 'SUB'])
const methodSchema = z.enum(['QR_DONG', 'VI_DIEN_TU', 'THE_NOI_DIA'], {
  error: 'Vui lòng chọn hình thức'
})
const channelSchema = z.enum(['WEB', 'APP', 'POS'])
const statusSchema = z.enum(['ACTIVE', 'INACTIVE'])
const amountSchema = (label: string) =>
  z
    .number({ error: `Vui lòng nhập ${label}` })
    .int('Hạn mức phải là số nguyên')
    .nonnegative('Hạn mức không được âm')

export const paymentMethodSchema = z
  .object({
    scope: scopeSchema,
    merchantCode: z.string().trim().min(1, 'Vui lòng nhập mã merchant'),
    method: methodSchema,
    channel: channelSchema,
    minAmount: amountSchema('hạn mức tối thiểu'),
    maxAmount: amountSchema('hạn mức tối đa'),
    feeLabel: z.string().trim().min(1, 'Vui lòng nhập biểu phí'),
    status: statusSchema
  })
  .superRefine((values, context) => {
    if (values.maxAmount < values.minAmount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hạn mức tối đa phải lớn hơn hoặc bằng hạn mức tối thiểu',
        path: ['maxAmount']
      })
    }
  })

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>

export const paymentMethodFilterSchema = z.object({
  query: z.string().trim().max(100, 'Từ khóa tối đa 100 ký tự'),
  method: z.enum(['ALL', 'QR_DONG', 'VI_DIEN_TU', 'THE_NOI_DIA']),
  status: z.enum(['ALL', 'ACTIVE', 'INACTIVE'])
})

type Option<T extends string> = { label: string; value: T }

export const PAYMENT_METHOD_SCOPE_OPTIONS: Option<PaymentMethodScope>[] = [
  { label: 'Master', value: 'MASTER' },
  { label: 'Sub', value: 'SUB' }
]

export const PAYMENT_METHOD_OPTIONS: Option<PaymentMethodCode>[] = [
  { label: 'QR động', value: 'QR_DONG' },
  { label: 'Ví điện tử', value: 'VI_DIEN_TU' },
  { label: 'Thẻ nội địa', value: 'THE_NOI_DIA' }
]

export const PAYMENT_METHOD_CHANNEL_OPTIONS: Option<PaymentMethodChannel>[] = [
  { label: 'Website', value: 'WEB' },
  { label: 'Ứng dụng', value: 'APP' },
  { label: 'POS', value: 'POS' }
]

export const PAYMENT_METHOD_STATUS_OPTIONS: Option<PaymentMethodStatus>[] = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Ngưng hoạt động', value: 'INACTIVE' }
]

export const PAYMENT_METHOD_FILTER_OPTIONS = [
  { label: 'Tất cả', value: 'ALL' },
  ...PAYMENT_METHOD_OPTIONS
]

export const PAYMENT_METHOD_FILTER_STATUS_OPTIONS = [
  { label: 'Tất cả', value: 'ALL' },
  ...PAYMENT_METHOD_STATUS_OPTIONS
]
