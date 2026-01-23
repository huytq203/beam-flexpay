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
    fixedAmount: z.number().optional(),
    percentage: z.number().min(0, "Min is 0").max(100, "Max is 100").optional(),
    minFee: z.number().optional(),
    maxFee: z.number().optional(),
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
)

export type FeeComponentType = z.infer<typeof FeeComponentSchema>
