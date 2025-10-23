import { z, type ZodError } from 'zod'
import isNil from 'lodash/isNil'
import {
  ApplicationTypes,
  InboundFeeApplicationType,
  MethodsByTransactionType,
  type TransactionType,
  TransactionTypes,
  validateMethodsForTransactionType
} from '@type/inbound-fee'

// ============ CONSTANTS ============
export const FORM_INITIAL_VALUES = {
  applicationType: InboundFeeApplicationType.SYSTEM,
  transactionType: undefined, // Required field - user must select
  priceFrom: 0,
  priceTo: 0,
  method: [],
  bank: [],
  provider: [],
  flexibleFeeMpct: 0,
  fixedFee: 0,
  minFee: undefined,
  maxFee: undefined,
  vatMpct: 0,
  startDate: undefined, // Required field - user must select
  endDate: undefined
}

export const MOCK_PROVIDERS = [
  { value: 'vpbank', label: 'VPBank' },
  { value: 'napas', label: 'Napas' }
]

export const getPaymentMethods = (type: string) => {
  switch (type) {
    case 'deposit':
      return [
        { value: 'atm_card', label: 'Thẻ ATM' },
        { value: 'qr_code', label: 'QRCODE' },
        { value: 'bank_account_ib', label: 'Tài khoản Ngân hàng (IB)' }
      ]
    case 'withdrawal':
      return [
        { value: 'atm_ibft', label: 'Thẻ ATM (IBFT)' },
        { value: 'bank_account_ibft', label: 'Tài khoản Ngân hàng (IBFT)' }
      ]
    case 'payment':
    case 'refund':
      return [
        { value: 'ewallet', label: 'Ví điện tử' },
        { value: 'bank_count', label: 'Tài khoản ngân hàng' },
        { value: 'visa_international', label: 'Thẻ quốc tế VISA' },
        { value: 'master_international', label: 'Thẻ quốc tế MASTER' },
        { value: 'jcb_international', label: 'Thẻ quốc tế JCB' },
        { value: 'amex_international', label: 'Thẻ quốc tế AMEX' }
      ]
    case 'transfer':
      return [{ value: 'ewallet', label: 'Ví điện tử' }]
    default:
      return []
  }
}

export const inboundFeeFormSchema = z.object({
  // ============ REQUIRED FIELDS ============
  applicationType: z.string(),

  transactionType: z.string(),

  method: z.array(z.string())
    .min(1, 'Phải chọn ít nhất 1 phương thức giao dịch'),

  provider: z.array(z.string())
    .min(1, 'Phải chọn ít nhất 1 nhà cung cấp'),

  bank: z.array(z.string())
    .min(1, 'Phải chọn ít nhất 1 ngân hàng'),

  priceFrom: z.number()
    .min(0, 'Mức giao dịch từ phải >= 0')
    .max(999999999999, 'Mức giao dịch từ không được vượt quá 999,999,999,999'),

  priceTo: z.number()
    .min(0, 'Mức giao dịch đến phải >= 0')
    .max(999999999999, 'Mức giao dịch đến không được vượt quá 999,999,999,999'),

  startDate: z.any()
    .refine((val) => val !== null && val !== undefined, {
      message: 'Vui lòng chọn thời gian áp dụng'
    }),

  // ============ CONDITIONAL FIELDS ============
  accountGroup: z.string().optional(),
  phoneNumber: z.string().optional(),

  // ============ OPTIONAL FIELDS ============
  endDate: z.any().optional(),

  // Fee configuration (in percent format 0-100, NOT mpct)
  flexibleFeeMpct: z.number()
    .min(0, 'Phí linh hoạt phải >= 0')
    .max(100, 'Phí linh hoạt không được vượt quá 100%')
    .optional()
    .nullable(),

  fixedFee: z.number()
    .min(0, 'Phí cố định phải >= 0')
    .max(999999999999, 'Phí cố định không được vượt quá 999,999,999,999')
    .optional()
    .nullable(),

  minFee: z.union([
    z.number()
      .min(0, 'Phí tối thiểu phải từ 0 đến 999,999,999,999')
      .max(999999999999, 'Phí tối thiểu phải từ 0 đến 999,999,999,999'),
    z.null(),
    z.undefined()
  ]).optional(),

  maxFee: z.union([
    z.number()
      .min(0, 'Phí tối đa phải từ 0 đến 999,999,999,999')
      .max(999999999999, 'Phí tối đa phải từ 0 đến 999,999,999,999'),
    z.null(),
    z.undefined()
  ]).optional(),

  vatMpct: z.number()
    .min(0, 'VAT phải >= 0')
    .max(100, 'VAT không được vượt quá 100%')
    .optional()
    .nullable()
})
  // ============ CUSTOM REFINEMENTS ============
  .refine(data => {
    // Validation: applicationType must be one of the allowed values
    return ApplicationTypes.includes(data.applicationType as any)
  }, {
    message: 'Đối tượng áp dụng không hợp lệ',
    path: ['applicationType']
  })
  .refine(data => {
    // Validation: transactionType must be one of the allowed values
    return TransactionTypes.includes(data.transactionType as any)
  }, {
    message: 'Loại giao dịch không hợp lệ',
    path: ['transactionType']
  })
  .refine(data => {
    // Validation: methods - Nếu chọn 'all', không được chọn thêm methods khác
    if (data.method.includes('all') && data.method.length > 1) {
      return false
    }
    return true
  }, {
    message: 'Nếu chọn "Tất cả" phương thức, không được chọn thêm phương thức khác',
    path: ['method']
  })
  .refine(data => {
    // Validation: methods must match transaction type
    const allowedMethods = MethodsByTransactionType[data.transactionType as TransactionType]
    if (!allowedMethods) return true // Skip if transaction type is invalid

    // Check if all selected methods are allowed for this transaction type
    for (const method of data.method) {
      if (!allowedMethods.includes(method as any)) {
        return false
      }
    }
    return true
  }, {
    message: 'Phương thức giao dịch không phù hợp với loại giao dịch',
    path: ['method']
  })
  .refine(data => {
    // Validation: providers - Nếu chọn 'all', không được chọn thêm providers khác
    if (data.provider.includes('all') && data.provider.length > 1) {
      return false
    }
    return true
  }, {
    message: 'Nếu chọn "Tất cả" nhà cung cấp, không được chọn thêm nhà cung cấp khác',
    path: ['provider']
  })
  .refine(data => {
    // Validation: accountGroup required when applicationType = 'account_group'
    if (data.applicationType === 'account_group' && !data.accountGroup) {
      return false
    }
    return true
  }, {
    message: 'Vui lòng chọn nhóm tài khoản',
    path: ['accountGroup']
  })
  .refine(data => {
    // Validation: phoneNumber required when applicationType = 'individual'
    if (data.applicationType === 'individual' && !data.phoneNumber) {
      return false
    }
    return true
  }, {
    message: 'Vui lòng chọn khách hàng',
    path: ['phoneNumber']
  })
  .refine(data => {
    // Validation: priceTo must be greater than priceFrom
    if (data.priceTo <= data.priceFrom) {
      return false
    }
    return true
  }, {
    message: 'Mức giao dịch đến phải lớn hơn mức giao dịch từ',
    path: ['priceTo']
  })
  .refine(data => {
    // Validation: endDate must be greater than startDate (if provided)
    if (data.endDate && data.startDate) {
      const startTime = data.startDate.$d || data.startDate._d || new Date(data.startDate)
      const endTime = data.endDate.$d || data.endDate._d || new Date(data.endDate)
      if (endTime <= startTime) {
        return false
      }
    }
    return true
  }, {
    message: 'Thời gian kết thúc phải lớn hơn thời gian áp dụng',
    path: ['endDate']
  })
  .refine(data => {
    // Validation: startDate must be future date
    if (data.startDate) {
      const startTime = data.startDate.$d || data.startDate._d || new Date(data.startDate)
      const now = new Date()
      // Set time to start of day for comparison
      now.setHours(0, 0, 0, 0)
      const startDay = new Date(startTime)
      startDay.setHours(0, 0, 0, 0)
      if (startDay < now) {
        return false
      }
    }
    return true
  }, {
    message: 'Thời gian áp dụng phải là thời điểm trong tương lai',
    path: ['startDate']
  })
  .refine(data => {
    // Validation: At least one of flexibleFeeMpct or fixedFee must be provided and > 0
    const hasFlexibleFee = !isNil(data.flexibleFeeMpct)
    const hasFixedFee = !isNil(data.fixedFee)

    if (!hasFlexibleFee && !hasFixedFee) {
      return false
    }
    return true
  }, {
    message: 'Phải nhập ít nhất một trong hai: Phí linh hoạt hoặc Phí cố định',
    path: ['flexibleFeeMpct']
  })
  .refine(data => {
    // Validation: minFee required when flexibleFeeMpct > 0
    const hasFlexibleFee = !isNil(data.flexibleFeeMpct) && data.flexibleFeeMpct > 0
    const hasMinFee = !isNil(data.minFee)

    if (hasFlexibleFee && !hasMinFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối thiểu là bắt buộc khi có phí linh hoạt',
    path: ['minFee']
  })
  .refine(data => {
    // Validation: maxFee required when flexibleFeeMpct > 0
    const hasFlexibleFee = !isNil(data.flexibleFeeMpct) && data.flexibleFeeMpct > 0
    const hasMaxFee = !isNil(data.maxFee)

    if (hasFlexibleFee && !hasMaxFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối đa là bắt buộc khi có phí linh hoạt',
    path: ['maxFee']
  })
  .refine(data => {
    // Validation: maxFee must be greater than minFee (if both provided)
    if (!isNil(data.maxFee) && !isNil(data.minFee)) {
      if (data.maxFee <= data.minFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối đa phải lớn hơn phí tối thiểu',
    path: ['maxFee']
  })
  .refine(data => {
    // Validation: maxFee must be greater than fixedFee (if both provided)
    if (!isNil(data.maxFee) && !isNil(data.fixedFee)) {
      if (data.maxFee <= data.fixedFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối đa phải lớn hơn phí cố định',
    path: ['maxFee']
  })
  .refine(data => {
    // Validation: minFee cannot exceed fixedFee (if both provided)
    if (!isNil(data.minFee) && !isNil(data.fixedFee)) {
      if (data.minFee > data.fixedFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối thiểu không được vượt quá phí cố định',
    path: ['minFee']
  })
  .refine(data => {
    // Validation: VAT required when no fixedFee (but has flexibleFee)
    const hasFlexibleFee = !isNil(data.flexibleFeeMpct) && data.flexibleFeeMpct > 0
    const hasFixedFee = !isNil(data.fixedFee) && data.fixedFee > 0
    const hasVat = !isNil(data.vatMpct) && data.vatMpct >= 0

    // If there's flexible fee but no fixed fee, VAT is required
    if (hasFlexibleFee && !hasFixedFee && !hasVat) {
      return false
    }
    return true
  }, {
    message: 'VAT là bắt buộc khi chỉ có phí linh hoạt mà không có phí cố định',
    path: ['vatMpct']
  })

/**
 * Zod validation schema for API payload (with mpct values)
 * Based on backend API specification
 */
export const inboundFeeCreateSchema = z.object({
  // ============ REQUIRED FIELDS ============
  applicationType: z.string(),

  transactionType: z.string(),

  methods: z.array(z.string())
    .min(1, 'Phải chọn ít nhất 1 phương thức giao dịch'),

  providers: z.array(z.string())
    .min(1, 'Phải chọn ít nhất 1 nhà cung cấp'),

  priceFrom: z.number()
    .min(0, 'Mức giao dịch từ phải >= 0')
    .max(999999999999, 'Mức giao dịch từ không được vượt quá 999,999,999,999'),

  priceTo: z.number()
    .min(0, 'Mức giao dịch đến phải >= 0')
    .max(999999999999, 'Mức giao dịch đến không được vượt quá 999,999,999,999'),

  startDate: z.date(),

  // ============ OPTIONAL FIELDS ============
  customerId: z.number().int('Customer ID phải là số nguyên').optional(),
  accountGroupId: z.number().int('Account Group ID phải là số nguyên').optional(),
  bankIds: z.array(z.number().int('Bank ID phải là số nguyên')).optional(),
  endDate: z.date().optional(),

  // Fee configuration (in mpct format)
  flexibleFeeMpct: z.number()
    .min(0, 'Phí linh hoạt phải >= 0')
    .max(100000, 'Phí linh hoạt không được vượt quá 100,000 mpct (100%)')
    .optional(),

  fixedFee: z.number()
    .min(0, 'Phí cố định phải >= 0')
    .max(999999999999, 'Phí cố định không được vượt quá 999,999,999,999')
    .optional(),

  minFee: z.number()
    .min(0, 'Phí tối thiểu phải >= 0')
    .max(999999999999, 'Phí tối thiểu không được vượt quá 999,999,999,999')
    .optional(),

  maxFee: z.number()
    .min(0, 'Phí tối đa phải >= 0')
    .max(999999999999, 'Phí tối đa không được vượt quá 999,999,999,999')
    .optional(),

  vatMpct: z.number()
    .min(0, 'VAT phải >= 0')
    .max(100000, 'VAT không được vượt quá 100,000 mpct (100%)')
    .optional()
})
  // ============ CUSTOM REFINEMENTS ============
  .refine(data => {
    // Validation: applicationType must be one of the allowed values
    return ApplicationTypes.includes(data.applicationType as any)
  }, {
    message: 'Đối tượng áp dụng không hợp lệ',
    path: ['applicationType']
  })
  .refine(data => {
    // Validation: transactionType must be one of the allowed values
    return TransactionTypes.includes(data.transactionType as any)
  }, {
    message: 'Loại giao dịch không hợp lệ',
    path: ['transactionType']
  })
  .refine(data => {
    // Validation 1: methods - Nếu chọn 'all', không được chọn thêm methods khác
    if (data.methods.includes('all') && data.methods.length > 1) {
      return false
    }
    return true
  }, {
    message: 'Nếu chọn "Tất cả" phương thức, không được chọn thêm phương thức khác',
    path: ['methods']
  })
  .refine(data => {
    // Validation: methods must match transaction type
    const allowedMethods = MethodsByTransactionType[data.transactionType as TransactionType]
    if (!allowedMethods) return true // Skip if transaction type is invalid

    // Check if all selected methods are allowed for this transaction type
    for (const method of data.methods) {
      if (!allowedMethods.includes(method as any)) {
        return false
      }
    }
    return true
  }, {
    message: 'Phương thức giao dịch không phù hợp với loại giao dịch',
    path: ['methods']
  })
  .refine(data => {
    // Validation 2: providers - Nếu chọn 'all', không được chọn thêm providers khác
    if (data.providers.includes('all') && data.providers.length > 1) {
      return false
    }
    return true
  }, {
    message: 'Nếu chọn "Tất cả" nhà cung cấp, không được chọn thêm nhà cung cấp khác',
    path: ['providers']
  })
  .refine(data => {
    // Validation 3: customerId required when applicationType = 'individual'
    if (data.applicationType === 'individual' && !data.customerId) {
      return false
    }
    return true
  }, {
    message: 'Vui lòng chọn khách hàng khi áp dụng cho đối tượng riêng',
    path: ['customerId']
  })
  .refine(data => {
    // Validation 4: accountGroupId required when applicationType = 'account_group'
    if (data.applicationType === 'account_group' && !data.accountGroupId) {
      return false
    }
    return true
  }, {
    message: 'Vui lòng chọn nhóm tài khoản khi áp dụng cho nhóm tài khoản',
    path: ['accountGroupId']
  })
  .refine(data => {
    // Validation 5: priceTo must be greater than priceFrom
    if (data.priceTo <= data.priceFrom) {
      return false
    }
    return true
  }, {
    message: 'Mức giao dịch đến phải lớn hơn mức giao dịch từ',
    path: ['priceTo']
  })
  .refine(data => {
    // Validation 6: endDate must be greater than startDate (if provided)
    if (data.endDate && data.startDate && data.endDate <= data.startDate) {
      return false
    }
    return true
  }, {
    message: 'Thời gian kết thúc phải lớn hơn thời gian áp dụng',
    path: ['endDate']
  })
  .refine(data => {
    // Validation 7: At least one of flexibleFeeMpct or fixedFee must be provided
    if (!data.flexibleFeeMpct && !data.fixedFee) {
      return false
    }
    return true
  }, {
    message: 'Phải nhập ít nhất một trong hai: Phí linh hoạt hoặc Phí cố định',
    path: ['flexibleFeeMpct']
  })
  .refine(data => {
    // Validation 8: minFee required when flexibleFeeMpct > 0
    if (data.flexibleFeeMpct && data.flexibleFeeMpct > 0 && !data.minFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối thiểu là bắt buộc khi có phí linh hoạt',
    path: ['minFee']
  })
  .refine(data => {
    // Validation 9: maxFee must be greater than minFee (if both provided)
    if (data.maxFee && data.minFee && data.maxFee <= data.minFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối đa phải lớn hơn phí tối thiểu',
    path: ['maxFee']
  })
  .refine(data => {
    // Validation 10: maxFee must be greater than fixedFee (if both provided)
    if (data.maxFee && data.fixedFee && data.maxFee <= data.fixedFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối đa phải lớn hơn phí cố định',
    path: ['maxFee']
  })
  .refine(data => {
    // Validation 11: minFee cannot exceed fixedFee (if both provided)
    if (data.minFee && data.fixedFee && data.minFee > data.fixedFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối thiểu không được vượt quá phí cố định',
    path: ['minFee']
  })
  .refine(data => {
    // Validation 12: VAT required when no fixedFee (but has flexibleFee)
    const hasFlexibleFee = data.flexibleFeeMpct && data.flexibleFeeMpct > 0
    const hasFixedFee = data.fixedFee && data.fixedFee > 0
    const hasVat = !isNil(data.vatMpct) && data.vatMpct >= 0

    // If there's flexible fee but no fixed fee, VAT is required
    if (hasFlexibleFee && !hasFixedFee && !hasVat) {
      return false
    }
    return true
  }, {
    message: 'VAT là bắt buộc khi chỉ có phí linh hoạt mà không có phí cố định',
    path: ['vatMpct']
  })
  .refine(data => {
    // Validation 13: startDate must be future date
    if (data.startDate) {
      const now = new Date()
      // Set time to start of day for comparison
      now.setHours(0, 0, 0, 0)
      const startDay = new Date(data.startDate)
      startDay.setHours(0, 0, 0, 0)
      if (startDay < now) {
        return false
      }
    }
    return true
  }, {
    message: 'Thời gian áp dụng phải là thời điểm trong tương lai',
    path: ['startDate']
  })

/**
 * Type inference from schemas
 */
export type InboundFeeFormData = z.infer<typeof inboundFeeFormSchema>
export type InboundFeeCreateFormData = z.infer<typeof inboundFeeCreateSchema>

// Re-export validation helper from types for convenience
export { validateMethodsForTransactionType } from '@type/inbound-fee'

/**
 * Helper function to validate form UI data
 */
export const validateInboundFeeForm = (data: unknown) => {
  return inboundFeeFormSchema.safeParse(data)
}

/**
 * Helper function to validate API payload data
 */
export const validateInboundFeeCreate = (data: unknown) => {
  return inboundFeeCreateSchema.safeParse(data)
}

/**
 * Convert Zod errors to Ant Design Form errors format
 * @param zodError - Zod validation error
 * @returns Array of Ant Design field errors
 */
export const zodErrorsToAntdErrors = (zodError: ZodError<any>) => {
  return zodError.issues.map((issue) => ({
    name: issue.path as string[],
    errors: [issue.message]
  }))
}

/**
 * Sanitize and transform form data before validation
 * Implements auto-sanitization rules from backend specification
 */
export const sanitizeInboundFeeFormData = (data: any): any => {
  const sanitized = { ...data }

  // Auto-round numeric values
  if (typeof sanitized.priceFrom === 'number') {
    sanitized.priceFrom = Math.round(sanitized.priceFrom)
  }
  if (typeof sanitized.priceTo === 'number') {
    sanitized.priceTo = Math.round(sanitized.priceTo)
  }
  if (typeof sanitized.flexibleFeeMpct === 'number') {
    sanitized.flexibleFeeMpct = Math.round(sanitized.flexibleFeeMpct)
  }
  if (typeof sanitized.fixedFee === 'number') {
    sanitized.fixedFee = Math.round(sanitized.fixedFee)
  }
  if (typeof sanitized.minFee === 'number') {
    sanitized.minFee = Math.round(sanitized.minFee)
  }
  if (typeof sanitized.maxFee === 'number') {
    sanitized.maxFee = Math.round(sanitized.maxFee)
  }
  if (typeof sanitized.vatMpct === 'number') {
    sanitized.vatMpct = Math.round(sanitized.vatMpct)
  }

  // Remove duplicates from arrays
  if (Array.isArray(sanitized.method)) {
    sanitized.method = [...new Set(sanitized.method)]
  }
  if (Array.isArray(sanitized.provider)) {
    sanitized.provider = [...new Set(sanitized.provider)]
  }
  if (Array.isArray(sanitized.bank)) {
    sanitized.bank = [...new Set(sanitized.bank)]
  }

  // Remove conditional fields based on applicationType
  if (sanitized.applicationType !== 'individual') {
    delete sanitized.phoneNumber
    delete sanitized.customerId
  }
  if (sanitized.applicationType !== 'account_group') {
    delete sanitized.accountGroup
    delete sanitized.accountGroupId
  }

  return sanitized
}

