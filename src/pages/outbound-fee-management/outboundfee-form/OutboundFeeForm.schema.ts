import { z, type ZodError } from 'zod'
import isNil from 'lodash/isNil'
import {
  ApplicationTypes,
  MethodsByTransactionType,
  OutboundFeeApplicationType,
  type TransactionType,
  TransactionTypes,
  validateMethodsForTransactionType
} from '@type/outbound-fee'

// ============ CONSTANTS ============
export const FORM_INITIAL_VALUES = {
  applicationType: OutboundFeeApplicationType.SYSTEM,
  transactionType: undefined, // Required field - user must select
  priceFrom: 0,
  priceTo: 1,
  method: [],
  bank: [],
  provider: [],
  chargeWithin: true, // Required field for outbound fee
  // Payer fees (người chuyển)
  payerFlexibleFeeMpct: undefined,
  payerFixedFee: undefined,
  payerMinFee: undefined,
  payerMaxFee: undefined,
  // Receiver fees (người nhận)
  receiverFlexibleFeeMpct: undefined,
  receiverFixedFee: undefined,
  receiverMinFee: undefined,
  receiverMaxFee: undefined,
  startDate: undefined, // Required field - user must select
  endDate: undefined
}

export const MOCK_PROVIDERS = [
  { value: 'vpbank', label: 'VPBank' },
  { value: 'napas', label: 'Napas' },
  { value: 'vietqr', label: 'VietQR' }
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

export const outboundFeeFormSchema = z.object({
  // ============ REQUIRED FIELDS ============
  applicationType: z.string(),

  transactionType: z.string(),

  method: z.array(z.string())
    .min(1, 'Phải chọn ít nhất 1 phương thức giao dịch'),

  provider: z.array(z.string())
    .min(1, 'Phải chọn ít nhất 1 nhà cung cấp'),

  bank: z.array(z.string())
    .min(1, 'Phải chọn ít nhất 1 ngân hàng'),

  chargeWithin: z.boolean({
    required_error: 'Vui lòng chọn phí tính trong/ngoài'
  }),

  priceFrom: z.number()
    .min(0, 'Mức giao dịch từ phải >= 0')
    .max(999999999999, 'Mức giao dịch từ không được vượt quá 999,999,999,999'),

  priceTo: z.number()
    .min(1, 'Mức giao dịch đến phải lớn hơn hoặc bằng 1')
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

  // ============ PAYER FEES (Người chuyển) ============
  payerFlexibleFeeMpct: z.union([
    z.number()
      .min(0, 'Phí linh hoạt người chuyển phải >= 0')
      .max(100, 'Phí linh hoạt người chuyển không được vượt quá 100%'),
    z.null(),
    z.undefined()
  ]).optional(),

  payerFixedFee: z.union([
    z.number()
      .min(0, 'Phí cố định người chuyển phải >= 0')
      .max(999999999999, 'Phí cố định người chuyển không được vượt quá 999,999,999,999'),
    z.null(),
    z.undefined()
  ]).optional(),

  payerMinFee: z.union([
    z.number()
      .min(0, 'Phí tối thiểu người chuyển phải từ 0 đến 999,999,999,999')
      .max(999999999999, 'Phí tối thiểu người chuyển phải từ 0 đến 999,999,999,999'),
    z.null(),
    z.undefined()
  ]).optional(),

  payerMaxFee: z.union([
    z.number()
      .min(0, 'Phí tối đa người chuyển phải từ 0 đến 999,999,999,999')
      .max(999999999999, 'Phí tối đa người chuyển phải từ 0 đến 999,999,999,999'),
    z.null(),
    z.undefined()
  ]).optional(),

  // ============ RECEIVER FEES (Người nhận) ============
  receiverFlexibleFeeMpct: z.union([
    z.number()
      .min(0, 'Phí linh hoạt người nhận phải >= 0')
      .max(100, 'Phí linh hoạt người nhận không được vượt quá 100%'),
    z.null(),
    z.undefined()
  ]).optional(),

  receiverFixedFee: z.union([
    z.number()
      .min(0, 'Phí cố định người nhận phải >= 0')
      .max(999999999999, 'Phí cố định người nhận không được vượt quá 999,999,999,999'),
    z.null(),
    z.undefined()
  ]).optional(),

  receiverMinFee: z.union([
    z.number()
      .min(0, 'Phí tối thiểu người nhận phải từ 0 đến 999,999,999,999')
      .max(999999999999, 'Phí tối thiểu người nhận phải từ 0 đến 999,999,999,999'),
    z.null(),
    z.undefined()
  ]).optional(),

  receiverMaxFee: z.union([
    z.number()
      .min(0, 'Phí tối đa người nhận phải từ 0 đến 999,999,999,999')
      .max(999999999999, 'Phí tối đa người nhận phải từ 0 đến 999,999,999,999'),
    z.null(),
    z.undefined()
  ]).optional()
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
  // ============ PAYER FEE VALIDATIONS ============
  .refine(data => {
    // Payer Rule 1: minFee required when flexibleFeeMpct > 0
    const hasPayerFlexibleFee = !isNil(data.payerFlexibleFeeMpct) && data.payerFlexibleFeeMpct > 0
    const hasPayerMinFee = !isNil(data.payerMinFee)

    if (hasPayerFlexibleFee && !hasPayerMinFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối thiểu người chuyển là bắt buộc khi có phí linh hoạt',
    path: ['payerMinFee']
  })
  .refine(data => {
    // Payer Rule 2: maxFee required when flexibleFeeMpct > 0
    const hasPayerFlexibleFee = !isNil(data.payerFlexibleFeeMpct) && data.payerFlexibleFeeMpct > 0
    const hasPayerMaxFee = !isNil(data.payerMaxFee)

    if (hasPayerFlexibleFee && !hasPayerMaxFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối đa người chuyển là bắt buộc khi có phí linh hoạt',
    path: ['payerMaxFee']
  })
  .refine(data => {
    // Payer Rule 3: minFee <= fixedFee (if both provided)
    if (!isNil(data.payerMinFee) && !isNil(data.payerFixedFee)) {
      if (data.payerMinFee > data.payerFixedFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối thiểu người chuyển không được lớn hơn phí cố định',
    path: ['payerMinFee']
  })
  .refine(data => {
    // Payer Rule 4: maxFee > fixedFee (if both provided)
    if (!isNil(data.payerMaxFee) && !isNil(data.payerFixedFee)) {
      if (data.payerMaxFee <= data.payerFixedFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối đa người chuyển phải lớn hơn phí cố định',
    path: ['payerMaxFee']
  })
  .refine(data => {
    // Payer Rule 5: maxFee >= minFee
    if (!isNil(data.payerMaxFee) && !isNil(data.payerMinFee)) {
      if (data.payerMaxFee < data.payerMinFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối đa người chuyển phải >= phí tối thiểu',
    path: ['payerMaxFee']
  })
  // ============ RECEIVER FEE VALIDATIONS ============
  .refine(data => {
    // Receiver Rule 1: minFee required when flexibleFeeMpct > 0
    const hasReceiverFlexibleFee = !isNil(data.receiverFlexibleFeeMpct) && data.receiverFlexibleFeeMpct > 0
    const hasReceiverMinFee = !isNil(data.receiverMinFee)

    if (hasReceiverFlexibleFee && !hasReceiverMinFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối thiểu người nhận là bắt buộc khi có phí linh hoạt',
    path: ['receiverMinFee']
  })
  .refine(data => {
    // Receiver Rule 2: maxFee required when flexibleFeeMpct > 0
    const hasReceiverFlexibleFee = !isNil(data.receiverFlexibleFeeMpct) && data.receiverFlexibleFeeMpct > 0
    const hasReceiverMaxFee = !isNil(data.receiverMaxFee)

    if (hasReceiverFlexibleFee && !hasReceiverMaxFee) {
      return false
    }
    return true
  }, {
    message: 'Phí tối đa người nhận là bắt buộc khi có phí linh hoạt',
    path: ['receiverMaxFee']
  })
  .refine(data => {
    // Receiver Rule 3: minFee <= fixedFee (if both provided)
    if (!isNil(data.receiverMinFee) && !isNil(data.receiverFixedFee)) {
      if (data.receiverMinFee > data.receiverFixedFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối thiểu người nhận không được lớn hơn phí cố định',
    path: ['receiverMinFee']
  })
  .refine(data => {
    // Receiver Rule 4: maxFee > fixedFee (if both provided)
    if (!isNil(data.receiverMaxFee) && !isNil(data.receiverFixedFee)) {
      if (data.receiverMaxFee <= data.receiverFixedFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối đa người nhận phải lớn hơn phí cố định',
    path: ['receiverMaxFee']
  })
  .refine(data => {
    // Receiver Rule 5: maxFee >= minFee
    if (!isNil(data.receiverMaxFee) && !isNil(data.receiverMinFee)) {
      if (data.receiverMaxFee < data.receiverMinFee) {
        return false
      }
    }
    return true
  }, {
    message: 'Phí tối đa người nhận phải >= phí tối thiểu',
    path: ['receiverMaxFee']
  })

/**
 * Zod validation schema for API payload (with mpct values)
 * Based on backend API specification
 */
export const outboundFeeCreateSchema = z.object({
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
    .min(1, 'Mức giao dịch đến phải lớn hơn hoặc bằng 1')
    .max(999999999999, 'Mức giao dịch đến không được vượt quá 999,999,999,999'),

  startDate: z.date(),

  chargeWithin: z.boolean({
    required_error: 'Vui lòng chọn phí tính trong/ngoài'
  }),

  // ============ OPTIONAL FIELDS ============
  customerId: z.number().int('Customer ID phải là số nguyên').optional(),
  accountGroupId: z.number().int('Account Group ID phải là số nguyên').optional(),
  bankIds: z.array(z.number().int('Bank ID phải là số nguyên')).optional(),
  endDate: z.date().optional(),

  // ============ PAYER FEES (in mpct format) ============
  payerFlexibleFeeMpct: z.number()
    .min(0, 'Phí linh hoạt người chuyển phải >= 0')
    .max(100000, 'Phí linh hoạt người chuyển không được vượt quá 100,000 mpct (100%)')
    .optional(),

  payerFixedFee: z.number()
    .min(0, 'Phí cố định người chuyển phải >= 0')
    .max(999999999999, 'Phí cố định người chuyển không được vượt quá 999,999,999,999')
    .optional(),

  payerMinFee: z.number()
    .min(0, 'Phí tối thiểu người chuyển phải >= 0')
    .max(999999999999, 'Phí tối thiểu người chuyển không được vượt quá 999,999,999,999')
    .optional(),

  payerMaxFee: z.number()
    .min(0, 'Phí tối đa người chuyển phải >= 0')
    .max(999999999999, 'Phí tối đa người chuyển không được vượt quá 999,999,999,999')
    .optional(),

  // ============ RECEIVER FEES (in mpct format) ============
  receiverFlexibleFeeMpct: z.number()
    .min(0, 'Phí linh hoạt người nhận phải >= 0')
    .max(100000, 'Phí linh hoạt người nhận không được vượt quá 100,000 mpct (100%)')
    .optional(),

  receiverFixedFee: z.number()
    .min(0, 'Phí cố định người nhận phải >= 0')
    .max(999999999999, 'Phí cố định người nhận không được vượt quá 999,999,999,999')
    .optional(),

  receiverMinFee: z.number()
    .min(0, 'Phí tối thiểu người nhận phải >= 0')
    .max(999999999999, 'Phí tối thiểu người nhận không được vượt quá 999,999,999,999')
    .optional(),

  receiverMaxFee: z.number()
    .min(0, 'Phí tối đa người nhận phải >= 0')
    .max(999999999999, 'Phí tối đa người nhận không được vượt quá 999,999,999,999')
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
  // ============ PAYER FEE VALIDATIONS (API Payload) ============
  .refine(data => {
    // Payer Rule 1: minFee required when flexibleFeeMpct > 0
    const hasPayerFlexibleFee = !isNil(data.payerFlexibleFeeMpct) && data.payerFlexibleFeeMpct > 0
    const hasPayerMinFee = !isNil(data.payerMinFee)
    if (hasPayerFlexibleFee && !hasPayerMinFee) return false
    return true
  }, {
    message: 'Phí tối thiểu người chuyển là bắt buộc khi có phí linh hoạt',
    path: ['payerMinFee']
  })
  .refine(data => {
    // Payer Rule 2: maxFee required when flexibleFeeMpct > 0
    const hasPayerFlexibleFee = !isNil(data.payerFlexibleFeeMpct) && data.payerFlexibleFeeMpct > 0
    const hasPayerMaxFee = !isNil(data.payerMaxFee)
    if (hasPayerFlexibleFee && !hasPayerMaxFee) return false
    return true
  }, {
    message: 'Phí tối đa người chuyển là bắt buộc khi có phí linh hoạt',
    path: ['payerMaxFee']
  })
  .refine(data => {
    // Payer Rule 3: minFee <= fixedFee
    if (!isNil(data.payerMinFee) && !isNil(data.payerFixedFee)) {
      if (data.payerMinFee > data.payerFixedFee) return false
    }
    return true
  }, {
    message: 'Phí tối thiểu người chuyển không được lớn hơn phí cố định',
    path: ['payerMinFee']
  })
  .refine(data => {
    // Payer Rule 4: maxFee > fixedFee
    if (!isNil(data.payerMaxFee) && !isNil(data.payerFixedFee)) {
      if (data.payerMaxFee <= data.payerFixedFee) return false
    }
    return true
  }, {
    message: 'Phí tối đa người chuyển phải lớn hơn phí cố định',
    path: ['payerMaxFee']
  })
  .refine(data => {
    // Payer Rule 5: maxFee >= minFee
    if (!isNil(data.payerMaxFee) && !isNil(data.payerMinFee)) {
      if (data.payerMaxFee < data.payerMinFee) return false
    }
    return true
  }, {
    message: 'Phí tối đa người chuyển phải >= phí tối thiểu',
    path: ['payerMaxFee']
  })
  // ============ RECEIVER FEE VALIDATIONS (API Payload) ============
  .refine(data => {
    // Receiver Rule 1: minFee required when flexibleFeeMpct > 0
    const hasReceiverFlexibleFee = !isNil(data.receiverFlexibleFeeMpct) && data.receiverFlexibleFeeMpct > 0
    const hasReceiverMinFee = !isNil(data.receiverMinFee)
    if (hasReceiverFlexibleFee && !hasReceiverMinFee) return false
    return true
  }, {
    message: 'Phí tối thiểu người nhận là bắt buộc khi có phí linh hoạt',
    path: ['receiverMinFee']
  })
  .refine(data => {
    // Receiver Rule 2: maxFee required when flexibleFeeMpct > 0
    const hasReceiverFlexibleFee = !isNil(data.receiverFlexibleFeeMpct) && data.receiverFlexibleFeeMpct > 0
    const hasReceiverMaxFee = !isNil(data.receiverMaxFee)
    if (hasReceiverFlexibleFee && !hasReceiverMaxFee) return false
    return true
  }, {
    message: 'Phí tối đa người nhận là bắt buộc khi có phí linh hoạt',
    path: ['receiverMaxFee']
  })
  .refine(data => {
    // Receiver Rule 3: minFee <= fixedFee
    if (!isNil(data.receiverMinFee) && !isNil(data.receiverFixedFee)) {
      if (data.receiverMinFee > data.receiverFixedFee) return false
    }
    return true
  }, {
    message: 'Phí tối thiểu người nhận không được lớn hơn phí cố định',
    path: ['receiverMinFee']
  })
  .refine(data => {
    // Receiver Rule 4: maxFee > fixedFee
    if (!isNil(data.receiverMaxFee) && !isNil(data.receiverFixedFee)) {
      if (data.receiverMaxFee <= data.receiverFixedFee) return false
    }
    return true
  }, {
    message: 'Phí tối đa người nhận phải lớn hơn phí cố định',
    path: ['receiverMaxFee']
  })
  .refine(data => {
    // Receiver Rule 5: maxFee >= minFee
    if (!isNil(data.receiverMaxFee) && !isNil(data.receiverMinFee)) {
      if (data.receiverMaxFee < data.receiverMinFee) return false
    }
    return true
  }, {
    message: 'Phí tối đa người nhận phải >= phí tối thiểu',
    path: ['receiverMaxFee']
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
export type OutboundFeeFormData = z.infer<typeof outboundFeeFormSchema>
export type OutboundFeeCreateFormData = z.infer<typeof outboundFeeCreateSchema>

// Re-export validation helper from types for convenience
export { validateMethodsForTransactionType } from '@type/outbound-fee'

/**
 * Helper function to validate form UI data
 */
export const validateOutboundFeeForm = (data: unknown) => {
  return outboundFeeFormSchema.safeParse(data)
}

/**
 * Helper function to validate API payload data
 */
export const validateOutboundFeeCreate = (data: unknown) => {
  return outboundFeeCreateSchema.safeParse(data)
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
export const sanitizeOutboundFeeFormData = (data: any): any => {
  const sanitized = { ...data }

  // Auto-round numeric values - price ranges
  if (typeof sanitized.priceFrom === 'number') {
    sanitized.priceFrom = Math.round(sanitized.priceFrom)
  }
  if (typeof sanitized.priceTo === 'number') {
    sanitized.priceTo = Math.round(sanitized.priceTo)
  }

  // Auto-round payer fees
  if (typeof sanitized.payerFlexibleFeeMpct === 'number') {
    sanitized.payerFlexibleFeeMpct = Math.round(sanitized.payerFlexibleFeeMpct)
  }
  if (typeof sanitized.payerFixedFee === 'number') {
    sanitized.payerFixedFee = Math.round(sanitized.payerFixedFee)
  }
  if (typeof sanitized.payerMinFee === 'number') {
    sanitized.payerMinFee = Math.round(sanitized.payerMinFee)
  }
  if (typeof sanitized.payerMaxFee === 'number') {
    sanitized.payerMaxFee = Math.round(sanitized.payerMaxFee)
  }

  // Auto-round receiver fees
  if (typeof sanitized.receiverFlexibleFeeMpct === 'number') {
    sanitized.receiverFlexibleFeeMpct = Math.round(sanitized.receiverFlexibleFeeMpct)
  }
  if (typeof sanitized.receiverFixedFee === 'number') {
    sanitized.receiverFixedFee = Math.round(sanitized.receiverFixedFee)
  }
  if (typeof sanitized.receiverMinFee === 'number') {
    sanitized.receiverMinFee = Math.round(sanitized.receiverMinFee)
  }
  if (typeof sanitized.receiverMaxFee === 'number') {
    sanitized.receiverMaxFee = Math.round(sanitized.receiverMaxFee)
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
