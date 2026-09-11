import { z } from 'zod'

/**
 * Hình dạng dữ liệu gửi lên service phí. Đây là nguồn sự thật kiểu cho tầng
 * service — form của màn cấu hình có schema riêng, rộng hơn (có cả tiêu chí gán
 * đối tượng), rồi mới rút gọn về hai payload ở đây.
 *
 * Hai định dạng ngày KHÔNG giống nhau và đó không phải nhầm lẫn:
 * `FeePolicyCreateRequest` để Jackson đọc ISO mặc định, còn
 * `FeePolicyAssignmentCreateRequest` khai `@JsonFormat("yyyy-MM-dd HH:mm:ss")`.
 * Gửi sai kiểu nào cũng ăn 400 ở bước parse, trước khi chạm validator.
 */

/** `yyyy-MM-ddTHH:mm:ss` — dùng cho chính sách. */
export const POLICY_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss'

/** `yyyy-MM-dd HH:mm:ss` — dùng cho bản gán. */
export const ASSIGNMENT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const feeSetupTierSchema = z.object({
  /** Số nguyên: quy tắc liền mạch giữa các bậc là cộng một. */
  minValue: z.number().int(),
  /** Bỏ trống nghĩa là vô cùng. */
  maxValue: z.number().int().nullable().optional(),
  roundMode: z.string(),
  minFee: z.number().int().min(0),
  maxFee: z.number().int().min(0),
  fixedAmount: z.number().int().min(0),
  percentage: z.number().min(0).max(100)
})

export const feeSetupComponentSchema = z.object({
  componentType: z.string(),
  /** `AMOUNT` tính trên tiền giao dịch, `FEE_COMPONENT` tính trên thành phần khác. */
  baseOn: z.string(),
  baseComponentType: z.string().nullable().optional(),
  calculationMethod: z.string(),
  fixedAmount: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
  roundMode: z.string(),
  minFee: z.number().int().min(0),
  maxFee: z.number().int().min(0),
  payerType: z.string(),
  beneficiaryType: z.string(),
  /** Rỗng với thành phần tính trực tiếp. */
  tiers: z.array(feeSetupTierSchema)
})

export const feeSetupPolicySchema = z.object({
  name: z.string().min(1).max(255),
  serviceType: z.string(),
  description: z.string().max(2000).optional(),
  feeDomain: z.enum(['BANK', 'EWALLET', 'MERCHANT']),
  currency: z.literal('VND'),
  validFrom: z.string(),
  validTo: z.string().optional(),
  priority: z.number().int().min(0)
})

export const feePolicySetupRequestSchema = z.object({
  policy: feeSetupPolicySchema,
  /**
   * Thứ tự có nghĩa: thành phần tính dựa trên một thành phần khác phải đứng sau
   * thành phần nó tham chiếu.
   */
  components: z.array(feeSetupComponentSchema).min(1).max(32)
})

export const feeAssignmentCreateRequestSchema = z.object({
  feePolicyId: z.string(),
  /** Phải trùng loại dịch vụ của chính sách, backend so khớp chính xác. */
  serviceType: z.string(),
  merchantId: z.string().optional(),
  bankCode: z.string().optional(),
  paymentMethod: z.string().optional(),
  effectiveFromDate: z.string().optional(),
  effectiveToDate: z.string().optional()
})

export type FeeSetupTier = z.infer<typeof feeSetupTierSchema>
export type FeeSetupComponent = z.infer<typeof feeSetupComponentSchema>
export type FeeSetupPolicy = z.infer<typeof feeSetupPolicySchema>
export type FeePolicySetupRequest = z.infer<typeof feePolicySetupRequestSchema>
export type FeeAssignmentCreateRequest = z.infer<
  typeof feeAssignmentCreateRequestSchema
>

/** Chính sách vừa lưu, đủ để màn cấu hình dựng lại phần tóm tắt. */
export interface FeePolicySetupResponse {
  policy: {
    id: string
    name: string
    serviceType: string
    feeDomain: string
    status: string
    priority: number
    validFrom: string
    validTo: string | null
  }
  components: unknown[]
}
