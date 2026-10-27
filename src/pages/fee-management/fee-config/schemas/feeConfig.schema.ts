import {
  allowsMerchantCriteria,
  validateRefundDebitedSide
} from '@utils/fee-execution'
import { z } from 'zod'
import {
  allowsProviderCriteria,
  isMerchantAssignmentFlow,
  isPaymentMethodAllowed
} from '../constants/feeConfigFields'
import { allowsOriginalTypeCriteria } from '../constants/feeRefundOriginalType'
import {
  allowsGrossAmountBase,
  GROSS_AMOUNT_BASE
} from '../utils/feeComponentBaseOptions'
import { validateTransferBearers } from '../utils/transferBearers'
import {
  DUPLICATE_FEE_COMPONENT_MESSAGE,
  feeComponentFormSchema
} from './feeComponent.schema'
export {
  CalculationMethod,
  usesTiers,
  feeTierFormSchema,
  getTierStart,
  feeComponentFormSchema,
  DUPLICATE_FEE_COMPONENT_MESSAGE,
  TIER_RATE_MISSING_MESSAGE,
  createFeeComponentFormSchema
} from './feeComponent.schema'
export type {
  FeeTierFormValues,
  FeeComponentFormValues
} from './feeComponent.schema'

/** Hình dạng form dùng chung cho chính sách phí khách và phí đầu vào; luật theo loại nằm ở schema từng loại. */
export const feeConfigObjectSchema = z.object({
  feeDomain: z.enum(['BANK', 'EWALLET', 'MERCHANT']),
  name: z
    .string()
    .trim()
    .min(1, 'Nhập tên chính sách phí')
    .max(255, 'Tên tối đa 255 ký tự'),
  description: z.string().max(2000, 'Mô tả tối đa 2000 ký tự'),
  priority: z.number().int().min(0),
  serviceType: z.string().min(1, 'Chọn loại giao dịch'),
  bankCode: z.string(),
  /** NCC (cổng trung gian). Rỗng = mọi NCC và bị bỏ khỏi payload. */
  providerCode: z.string().optional(),
  /** Loại giao dịch gốc của hoàn tiền. Rỗng = mọi loại và bị bỏ khỏi payload. */
  originalTransactionType: z.string().optional(),
  /** Chuỗi rỗng = áp dụng cho tất cả phương thức và bị bỏ khỏi payload. */
  paymentMethod: z.string(),
  merchantId: z.string(),
  /** Đối tượng áp dụng: tất cả, một nhóm, hay một cá nhân. */
  assignmentScope: z.enum(['ALL', 'SEGMENT', 'SUBJECT']),
  /** Mã chủ ví được gán riêng. Rỗng = áp cho mọi người dùng. */
  subjectId: z.string(),
  /** Mã phân khúc khách hàng. Rỗng = áp cho mọi phân khúc. */
  customerGroup: z.string(),
  validFrom: z.string().min(1, 'Chọn ngày áp dụng từ'),
  validTo: z.string(),
  components: z
    .array(feeComponentFormSchema)
    .min(1, 'Chính sách phải có ít nhất một thành phần phí')
    .max(32, 'Tối đa 32 thành phần phí')
})

export const MERCHANT_PAYER_ONLY_MESSAGE =
  'Thu hộ / chi hộ hiện chỉ hỗ trợ Merchant chịu phí'

export type FeeConfigObjectValues = z.infer<typeof feeConfigObjectSchema>

/**
 * Luật chung của hai loại chính sách: tiêu chí gán, ngày hiệu lực và thứ tự thành phần.
 */
export const checkFeeConfigCommonRules = (
  form: FeeConfigObjectValues,
  ctx: z.RefinementCtx
) => {
  if (!isPaymentMethodAllowed(form.serviceType, form.paymentMethod)) {
    ctx.addIssue({
      code: 'custom',
      path: ['paymentMethod'],
      message: 'Phương thức không phù hợp với loại giao dịch đã chọn'
    })
  }

  if (form.providerCode && !allowsProviderCriteria(form.serviceType)) {
    ctx.addIssue({
      code: 'custom',
      path: ['providerCode'],
      message: 'Nhà cung cấp chỉ áp dụng cho nạp, rút ví và hoàn tiền'
    })
  }

  if (
    form.originalTransactionType &&
    !allowsOriginalTypeCriteria(form.serviceType)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['originalTransactionType'],
      message: 'Loại giao dịch gốc chỉ áp dụng cho phí hoàn tiền'
    })
  }

  const debitedSideError = validateRefundDebitedSide(
    form.serviceType,
    form.originalTransactionType,
    form.components
  )
  if (debitedSideError) {
    ctx.addIssue({
      code: 'custom',
      path: ['originalTransactionType'],
      message: debitedSideError
    })
  }

  if (form.assignmentScope === 'SEGMENT' && !form.customerGroup) {
    ctx.addIssue({
      code: 'custom',
      path: ['customerGroup'],
      message: 'Chọn nhóm khách hàng được áp dụng'
    })
  }

  if (form.assignmentScope === 'SUBJECT') {
    // Luồng merchant chọn qua ô Merchant (`merchantId`), luồng ví qua ô cá nhân (`subjectId`).
    if (isMerchantAssignmentFlow(form.feeDomain, form.serviceType)) {
      if (!form.merchantId) {
        ctx.addIssue({
          code: 'custom',
          path: ['merchantId'],
          message: 'Chọn merchant được áp dụng'
        })
      }
    } else if (!form.subjectId) {
      ctx.addIssue({
        code: 'custom',
        path: ['subjectId'],
        message: 'Chọn cá nhân được áp dụng'
      })
    }
  }

  if (form.feeDomain === 'BANK' && !form.bankCode) {
    ctx.addIssue({
      code: 'custom',
      path: ['bankCode'],
      message: 'Chính sách phí bank phải chỉ đúng một ngân hàng'
    })
  }

  if (form.validTo && form.validTo <= form.validFrom) {
    ctx.addIssue({
      code: 'custom',
      path: ['validTo'],
      message: 'Áp dụng đến phải sau áp dụng từ'
    })
  }

  // Cả hai bên cùng chịu (chuyển, nạp, rút, hoàn nạp/chuyển): cùng loại phí, VAT chỉ một dòng.
  const bearerError = validateTransferBearers(
    form.serviceType,
    form.components,
    form.originalTransactionType
  )
  if (bearerError) {
    ctx.addIssue({
      code: 'custom',
      path: ['components'],
      message: bearerError
    })
  }

  // Thành phần tính dựa trên thành phần khác chỉ hợp lệ khi thành phần được
  // tham chiếu đã đứng trước nó — backend kiểm theo đúng thứ tự trong mảng.
  const seen = new Set<string>()
  const identities = new Set<string>()
  form.components.forEach((component, index) => {
    // Thu hộ / chi hộ: backend chỉ chạy được payer MERCHANT. Chặn ở schema để dữ liệu cũ hay sửa tay
    // không lọt qua; payload không còn âm thầm đổi payer thay người vận hành.
    if (
      allowsMerchantCriteria(form.serviceType) &&
      component.feeScope === 'OUTPUT_FEE' &&
      component.payerType !== 'MERCHANT'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['components', index, 'payerType'],
        message: MERCHANT_PAYER_ONLY_MESSAGE
      })
    }
    const identity = `${component.componentType}:${component.payerType}:${component.beneficiaryType}`
    if (identities.has(identity)) {
      ctx.addIssue({
        code: 'custom',
        path: ['components', index, 'componentType'],
        message: DUPLICATE_FEE_COMPONENT_MESSAGE
      })
      ctx.addIssue({
        code: 'custom',
        path: ['components'],
        message: DUPLICATE_FEE_COMPONENT_MESSAGE
      })
    }
    identities.add(identity)
    if (
      component.baseOn === GROSS_AMOUNT_BASE &&
      !allowsGrossAmountBase(form.serviceType, component.feeScope)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['components', index, 'baseOn'],
        message:
          'Số tiền qua đối tác chỉ dùng cho phí đầu vào của nạp hoặc rút tiền ví'
      })
    }
    const scope = component.feeScope
    if (
      component.baseOn === 'FEE_COMPONENT' &&
      component.baseComponentType &&
      !seen.has(`${scope}:${component.baseComponentType}`)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['components', index, 'baseComponentType'],
        message: 'Thành phần được tham chiếu phải nằm phía trên trong danh sách'
      })
    }
    seen.add(`${scope}:${component.componentType}`)
  })
}

export const feeConfigFormSchema = feeConfigObjectSchema.superRefine(
  (form, ctx) => {
    // Chính sách phí khách chỉ chứa phí đầu ra; chi phí đầu vào khai ở chính sách riêng.
    if (
      form.components.some((component) => component.feeScope === 'INPUT_COST')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['components'],
        message:
          'Chính sách phí khách chỉ gồm phí đầu ra; phí đầu vào khai ở chính sách phí đầu vào riêng'
      })
    }

    checkFeeConfigCommonRules(form, ctx)
  }
)

export type FeeConfigFormValues = z.infer<typeof feeConfigFormSchema>
