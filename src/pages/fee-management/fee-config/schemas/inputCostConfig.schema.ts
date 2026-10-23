import { z } from 'zod'
import { FEE_SCOPE } from '../constants/feeConfigFields'
import {
  checkFeeConfigCommonRules,
  feeComponentFormSchema,
  feeConfigObjectSchema
} from './feeConfig.schema'

/**
 * Form chính sách phí đầu vào (`INPUT_COST`): chi phí Beam trả đối tác trên một tuyến thanh
 * toán. Cùng hình dạng giá trị với form phí khách để dùng chung ô nhập và hộp thoại thành phần,
 * nhưng mọi tiêu chí của khách phải trống và mọi thành phần phải là chi phí đầu vào do Hệ thống
 * chịu: backend từ chối cả hai.
 */
export const inputCostFormSchema = feeConfigObjectSchema
  .extend({
    components: z
      .array(feeComponentFormSchema)
      .min(1, 'Chính sách phí đầu vào cần ít nhất một thành phần chi phí')
      .max(32, 'Tối đa 32 thành phần phí')
  })
  .superRefine((form, ctx) => {
    form.components.forEach((component, index) => {
      if (component.feeScope !== FEE_SCOPE.INPUT_COST) {
        ctx.addIssue({
          code: 'custom',
          path: ['components', index, 'feeScope'],
          message: 'Chính sách phí đầu vào chỉ gồm thành phần phí đầu vào'
        })
        ctx.addIssue({
          code: 'custom',
          path: ['components'],
          message: 'Chính sách phí đầu vào chỉ gồm thành phần phí đầu vào'
        })
      }
      if (component.payerType !== 'SYSTEM') {
        ctx.addIssue({
          code: 'custom',
          path: ['components', index, 'payerType'],
          message: 'Phí đầu vào phải do Hệ thống chịu'
        })
      }
    })

    // Phí đầu vào không có đối tượng khách: giá do đối tác ký chung cho cả tuyến.
    const customerCriteria = [
      form.merchantId,
      form.subjectId,
      form.customerGroup,
      form.originalTransactionType
    ]
    if (customerCriteria.some(Boolean) || form.assignmentScope !== 'ALL') {
      ctx.addIssue({
        code: 'custom',
        path: ['assignmentScope'],
        message:
          'Phí đầu vào không gán theo merchant, nhóm khách, ví hay loại giao dịch gốc'
      })
    }

    checkFeeConfigCommonRules(form, ctx)
  })

export type InputCostFormValues = z.infer<typeof inputCostFormSchema>
