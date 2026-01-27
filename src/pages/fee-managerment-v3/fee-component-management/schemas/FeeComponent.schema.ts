import { z } from "zod"

export const FeeTierSchema = z.object({
    minFee: z.number().nullable().optional(),
    maxFee: z.number().nullable().optional(),
    fixedAmount: z.number().nullable().optional(),
    percentage: z.number().nullable().optional(),
    maxValue: z.number().nullable().optional(),
    minValue: z.number().nullable().optional(),
})

export const FeeComponentSchema = z.object({
    componentType: z.string().min(1, "Chọn loại phí"),
    baseOn: z.string().min(1, "Chọn tính dựa trên"),
    payerType: z.string().min(1, "Chọn người chịu phí"),
    beneficiaryType: z.string().min(1, "Chọn người hưởng phí"),
    roundMode: z.string().min(1, "Chọn công thức làm tròn"),
    calculationMethod: z.number().or(z.string()).optional(),
    tiers: z.array(FeeTierSchema).optional(),
    fixedAmount: z.number().min(0, "Phí cố định phải >= 0").optional(),
    percentage: z.number().min(0, "Phần trăm phải >= 0").max(100, "Phần trăm phải <= 100").optional(),
    minFee: z.number().min(0, "Phí tối thiểu phải >= 0").optional(),
    maxFee: z.number().min(0, "Phí tối đa phải >= 0").optional(),
    maxValue: z.number().optional(),
    minValue: z.number().optional(),

}).refine(
    (data) => {
        if (data.minValue !== undefined && data.maxValue !== undefined) {
            return data.minValue < data.maxValue
        }
        return true
    },
    {
        message: "Giá trị tối đa phải lớn hơn tối thiểu",
        path: ["minValue"],
    }
).refine(
    (data) => {
        // Validate percentage is required when componentType is VAT
        if (data.componentType === 'VAT') {
            return data.percentage !== undefined && data.percentage !== null
        }
        return true
    },
    {
        message: "Phí phần trăm không được để trống",
        path: ["percentage"],
    }
).refine(
    (data) => {
        // calculationMethod bắt buộc khi KHÔNG phải VAT
        if (data.componentType !== 'VAT') {
            return data.calculationMethod !== undefined && data.calculationMethod !== null && data.calculationMethod !== ''
        }
        return true
    },
    {
        message: "Chọn phương thức tính",
        path: ["calculationMethod"],
    }
).refine(
    (data) => {
        // Validate minFee <= maxFee
        if (data.minFee !== undefined && data.maxFee !== undefined && data.minFee !== null && data.maxFee !== null) {
            return data.minFee <= data.maxFee
        }
        return true
    },
    {
        message: "Phí tối đa phải >= phí tối thiểu",
        path: ["maxFee"],
    }
).refine(
    (data) => {
        // Validate: Khi DIRECT (không phải tier), ít nhất 1 field phải có giá trị
        const isDirect = data.calculationMethod === 'DIRECT'
        const isNotVAT = data.componentType !== 'VAT'

        if (isDirect && isNotVAT) {
            const hasFixedAmount = data.fixedAmount !== undefined && data.fixedAmount !== null && data.fixedAmount > 0
            const hasPercentage = data.percentage !== undefined && data.percentage !== null && data.percentage > 0
            const hasMinFee = data.minFee !== undefined && data.minFee !== null && data.minFee > 0
            const hasMaxFee = data.maxFee !== undefined && data.maxFee !== null && data.maxFee > 0

            return hasFixedAmount || hasPercentage || hasMinFee || hasMaxFee
        }
        return true
    },
    {
        message: "Ít nhất một trong các trường phí phải có giá trị",
        path: ["fixedAmount"],
    }
)

export type FeeComponentType = z.infer<typeof FeeComponentSchema>
