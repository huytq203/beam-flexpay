// ============================================
// Fee Management V3 - Zod Validation Schemas
// ============================================

import { z } from 'zod'

// ============================================
// Common Validation Rules
// ============================================
const requiredString = (fieldName: string) =>
  z.string({ message: `${fieldName} không được để trống` })
    .min(1, `${fieldName} không được để trống`)

const optionalString = () => z.string().optional()

const requiredSelect = (fieldName: string) =>
  z.string({ message: `Chọn ${fieldName}` })
    .min(1, `Chọn ${fieldName}`)

const positiveNumber = (fieldName: string) =>
  z.number({ message: `${fieldName} phải là số` })
    .min(0, `${fieldName} phải lớn hơn hoặc bằng 0`)

const percentageNumber = () =>
  z.number()
    .min(0, 'Tối thiểu là 0')
    .max(100, 'Tối đa là 100')
    .optional()

// ============================================
// Policy Schema
// ============================================
export const PolicySchema = z.object({
  name: requiredString('Tên chính sách'),
  validFrom: requiredString('Ngày bắt đầu'),
  validTo: z.string().nullable().optional(),
  priority: z.number({ message: 'Chọn mức độ ưu tiên' })
    .min(0, 'Mức độ ưu tiên phải >= 0'),
  status: requiredSelect('trạng thái'),
  feeDomain: requiredSelect('phí miền'),
  currency: requiredString('Loại tiền'),
  serviceType: requiredSelect('loại dịch vụ'),
  description: z.string().max(255, 'Tối đa 255 ký tự').optional()
}).refine(
  (data) => {
    if (!data.validFrom || !data.validTo) return true
    return new Date(data.validTo) >= new Date(data.validFrom)
  },
  {
    message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu',
    path: ['validTo']
  }
)

export type PolicyFormValues = z.infer<typeof PolicySchema>

// ============================================
// Fee Tier Schema
// ============================================
export const FeeTierSchema = z.object({
  id: z.string().optional(),
  minFee: z.number().nullable().optional(),
  maxFee: z.number().nullable().optional(),
  fixedAmount: z.number().nullable().optional(),
  percentage: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  minValue: z.number().nullable().optional()
}).refine(
  (data) => {
    if (data.minValue != null && data.maxValue != null) {
      return data.minValue < data.maxValue
    }
    return true
  },
  {
    message: 'Giá trị tối thiểu phải nhỏ hơn tối đa',
    path: ['minValue']
  }
).refine(
  (data) => {
    if (data.minFee != null && data.maxFee != null) {
      return data.minFee <= data.maxFee
    }
    return true
  },
  {
    message: 'Phí tối thiểu phải nhỏ hơn hoặc bằng phí tối đa',
    path: ['minFee']
  }
)

export type FeeTierFormValues = z.infer<typeof FeeTierSchema>

// ============================================
// Fee Component Schema
// ============================================
export const FeeComponentSchema = z.object({
  componentType: requiredSelect('loại phí'),
  baseOn: requiredSelect('tính dựa trên'),
  payerType: requiredSelect('người chịu phí'),
  beneficiaryType: requiredSelect('người hưởng phí'),
  roundMode: requiredSelect('công thức làm tròn'),
  calculationMethod: z.union([z.number(), z.string()]),
  tiers: z.array(FeeTierSchema).optional(),
  fixedAmount: z.number().optional(),
  percentage: percentageNumber(),
  minFee: z.number().optional(),
  maxFee: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional()
}).refine(
  (data) => {
    // VAT requires percentage
    if (data.componentType === 'VAT') {
      return data.percentage != null
    }
    return true
  },
  {
    message: 'Phí phần trăm không được để trống cho loại VAT',
    path: ['percentage']
  }
).refine(
  (data) => {
    if (data.minValue != null && data.maxValue != null) {
      return data.minValue < data.maxValue
    }
    return true
  },
  {
    message: 'Giá trị tối đa phải lớn hơn tối thiểu',
    path: ['minValue']
  }
)

export type FeeComponentFormValues = z.infer<typeof FeeComponentSchema>

// ============================================
// Assignment Schema
// ============================================
export const AssignmentSchema = z.object({
  feePolicyId: requiredString('Chính sách phí'),
  merchantId: z.string().nullable().optional(),
  bankCode: optionalString(),
  paymentMethod: optionalString(),
  cardType: optionalString(),
  serviceType: requiredSelect('loại dịch vụ'),
  customerGroup: optionalString(),
  status: requiredSelect('trạng thái'),
  applyType: optionalString(),
  account: optionalString()
}).refine(
  (data) => {
    // If applyType is '1' (account-based), account is required
    if (data.applyType === '1') {
      return !!data.account?.trim()
    }
    return true
  },
  {
    message: 'Vui lòng nhập tài khoản',
    path: ['account']
  }
).refine(
  (data) => {
    // If applyType is '2' (group-based), customerGroup is required
    if (data.applyType === '2') {
      return !!data.customerGroup?.trim()
    }
    return true
  },
  {
    message: 'Vui lòng chọn nhóm khách hàng',
    path: ['customerGroup']
  }
)

export type AssignmentFormValues = z.infer<typeof AssignmentSchema>

// ============================================
// Search Schemas
// ============================================
export const PolicySearchSchema = z.object({
  keyword: z.string().optional(),
  serviceType: z.string().optional(),
  feeDomain: z.string().optional(),
  status: z.string().optional()
})

export type PolicySearchValues = z.infer<typeof PolicySearchSchema>

export const AssignmentSearchSchema = z.object({
  account: z.string().optional(),
  applyDate: z.string().optional(),
  createDate: z.string().optional()
})

export type AssignmentSearchValues = z.infer<typeof AssignmentSearchSchema>
