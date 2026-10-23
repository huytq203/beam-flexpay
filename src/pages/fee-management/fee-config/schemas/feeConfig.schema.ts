import { validateRefundDebitedSide } from '@utils/fee-execution'
import { z } from 'zod'
import {
  allowsProviderCriteria,
  isPaymentMethodAllowed
} from '../constants/feeConfigFields'
import { allowsOriginalTypeCriteria } from '../constants/feeRefundOriginalType'
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

export const feeConfigFormSchema = z
  .object({
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
  .superRefine((form, ctx) => {
    if (
      form.components.length > 0 &&
      form.components.every((component) => component.feeScope === 'INPUT_COST')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['components'],
        message:
          'Cần ít nhất một phí đầu ra; nếu không thu khách, thêm phí đầu ra với công thức Miễn phí'
      })
    }

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

    if (form.assignmentScope === 'SUBJECT' && !form.subjectId) {
      ctx.addIssue({
        code: 'custom',
        path: ['subjectId'],
        message: 'Chọn cá nhân được áp dụng'
      })
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
      const scope = component.feeScope
      if (
        component.baseOn === 'FEE_COMPONENT' &&
        component.baseComponentType &&
        !seen.has(`${scope}:${component.baseComponentType}`)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['components', index, 'baseComponentType'],
          message:
            'Thành phần được tham chiếu phải nằm phía trên trong danh sách'
        })
      }
      seen.add(`${scope}:${component.componentType}`)
    })
  })

export type FeeConfigFormValues = z.infer<typeof feeConfigFormSchema>
