import { z } from 'zod'

export const feeDomainSchema = z.enum(['BANK', 'EWALLET', 'MERCHANT'])

export const feeAppliedObjectTypeSchema = z.enum([
  'ACCOUNT',
  'CUSTOMER_GROUP',
  'ALL'
])

export const feeEffectiveStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'EXPIRED'
])

export const feeComponentTypeSchema = z.enum([
  'TRANSACTION_FEE',
  'SYSTEM_FEE',
  'MERCHANT_FEE',
  'BANK_FEE',
  'PLATFORM_FEE',
  'VAT',
  'SERVICE_FEE',
  'PROCESSING_FEE',
  'REFUND_FEE'
])

export const applicableFeeRuleSchema = z.object({
  assignmentId: z.string().uuid(),
  feePolicyId: z.string().uuid(),
  feePolicyName: z.string(),
  appliedObjectType: feeAppliedObjectTypeSchema,
  customerGroup: z.string().nullable(),
  serviceType: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  cardType: z.string().nullable(),
  bankCode: z.string().nullable(),
  componentType: feeComponentTypeSchema,
  tierFrom: z.number().nullable(),
  tierTo: z.number().nullable(),
  formula: z.string(),
  minFee: z.number().nullable(),
  maxFee: z.number().nullable(),
  createdAt: z.string().nullable(),
  validFrom: z.string().nullable(),
  validTo: z.string().nullable(),
  effectiveStatus: feeEffectiveStatusSchema
})

const feePageSortSchema = z.object({
  empty: z.boolean(),
  sorted: z.boolean(),
  unsorted: z.boolean()
})

const feePageableSchema = z.object({
  pageNumber: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  offset: z.number().int().min(0),
  paged: z.boolean(),
  unpaged: z.boolean(),
  sort: feePageSortSchema
})

export const applicableFeeRulePageSchema = z.object({
  content: z.array(applicableFeeRuleSchema),
  pageable: feePageableSchema,
  totalElements: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  size: z.number().int().min(1),
  number: z.number().int().min(0),
  numberOfElements: z.number().int().min(0),
  first: z.boolean(),
  last: z.boolean(),
  empty: z.boolean(),
  sort: feePageSortSchema
})

/**
 * Hai trục lọc khác hẳn nhau trong cùng một bộ tham số:
 *
 * - `merchantId` / `customerGroup` trả lời "ví này chịu quy tắc nào", nên **bỏ
 *   trống là một điều kiện** (ví không thuộc merchant nào, chưa phân nhóm).
 * - Sáu tham số còn lại chỉ thu hẹp bảng đang hiển thị, nên **bỏ trống là không
 *   lọc**. Bản gán để trống ô điều kiện nghĩa là "áp dụng cho tất cả" — lọc
 *   `bankCode=VCB` vẫn phải trả về quy tắc không ghim ngân hàng vì chúng đang
 *   thực sự có hiệu lực với VCB.
 */
export const applicableFeeRuleQuerySchema = z.object({
  merchantId: z.string().uuid().optional(),
  customerGroup: z.string().min(1).optional(),
  feeDomain: feeDomainSchema.optional(),
  feePolicyId: z.string().uuid().optional(),
  serviceType: z.string().min(1).optional(),
  paymentMethod: z.string().min(1).optional(),
  bankCode: z.string().min(1).optional(),
  cardType: z.string().min(1).optional(),
  /** Suy ra tại thời điểm gọi, không phải cột lưu trong DB. */
  effectiveStatus: feeEffectiveStatusSchema.optional(),
  page: z.number().int().min(1).optional(),
  size: z.number().int().min(1).max(100).optional()
})

/** Sáu ô lọc thu hẹp bảng — tách riêng để form và query không lệch nhau. */
export const applicableFeeRuleFilterSchema = applicableFeeRuleQuerySchema.pick({
  feePolicyId: true,
  serviceType: true,
  paymentMethod: true,
  bankCode: true,
  cardType: true,
  effectiveStatus: true
})

export type ApplicableFeeRuleFilter = z.infer<
  typeof applicableFeeRuleFilterSchema
>

export type ApplicableFeeRule = z.infer<typeof applicableFeeRuleSchema>
export type ApplicableFeeRulePage = z.infer<
  typeof applicableFeeRulePageSchema
>
export type ApplicableFeeRuleQuery = z.infer<
  typeof applicableFeeRuleQuerySchema
>
/** Endpoint export không phân trang — bỏ `page`/`size` khỏi bộ lọc của bảng. */
export const applicableFeeRuleExportQuerySchema =
  applicableFeeRuleQuerySchema.omit({ page: true, size: true })

export type ApplicableFeeRuleExportQuery = z.infer<
  typeof applicableFeeRuleExportQuerySchema
>
export type FeeEffectiveStatus = z.infer<typeof feeEffectiveStatusSchema>
