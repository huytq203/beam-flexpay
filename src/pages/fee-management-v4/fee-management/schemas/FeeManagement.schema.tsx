import { z } from "zod";
import { normalizeText } from "@utils/helperFunctions";

export const PolicySchema = z.object({
    name: z.string({ message: "Tên chính sách không được để trống" }).min(1, "Tên chính sách không được để trống").max(150, "Tối đa 150 ký tự").transform(normalizeText),
    validFrom: z.string({ message: "Chọn ngày bắt đầu" }).min(1, "Chọn ngày bắt đầu"),
    validTo: z.string().nullable().optional(),
    priority: z.number({
        message: "Nhập mức độ ưu tiên",
    }).min(0, "Nhập mức độ ưu tiên").max(9999, 'Tối đa 9999'),
    status: z.string({
        message: "Chọn trạng thái",
    }).min(1, "Chọn trạng thái"),
    feeDomain: z.string({
        message: "Chọn phí miền",
    }).min(1, "Chọn phí miền"),
    currency: z.string({ message: "Đơn vị thanh toán không được để trống" }).min(1, "Đơn vị thanh toán không được để trống"),
    serviceType: z.string({
        message: "Chọn loại dịch vụ",
    }).min(1, "Chọn loại dịch vụ"),
    description: z.string().max(150, 'Tối đa 150 ký tự').optional(),
}).refine(
    (data) => !data.validFrom || !data.validTo || new Date(data.validTo) >= new Date(data.validFrom),
    {
        message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
        path: ["validTo"],
    }
);

export type PolicyType = z.infer<typeof PolicySchema>;



export const FeeTierSchema = z.object({
    minFee: z.number().nullable().optional(),
    maxFee: z.number().nullable().optional(),
    fixedAmount: z.number().nullable().optional(),
    percentage: z.number().nullable().optional(),
    maxValue: z.number().nullable().optional(),
    minValue: z.number().nullable().optional(),
});

export const FeeComponentSchema = z.object({
    componentType: z.string({ message: "Chọn loại phí" }).min(1, "Chọn loại phí"),
    baseOn: z.string({ message: "Chọn tính dựa trên" }).min(1, "Chọn tính dựa trên"),
    payerType: z.string({ message: "Chọn người chịu phí" }).min(1, "Chọn người chịu phí"),
    beneficiaryType: z.string({ message: "Chọn người hưởng phí" }).min(1, "Chọn người hưởng phí"),
    roundMode: z.string({ message: "Chọn công thức làm tròn" }).min(1, "Chọn công thức làm tròn"),
    calculationMethod: z.number().or(z.string()).optional(),
    tiers: z.array(FeeTierSchema).optional(),
    fixedAmount: z.number({ message: "Phí cố định phải >= 0" }).min(0, "Phí cố định phải >= 0").nullable().optional(),
    percentage: z.number({ message: "Phần trăm phải >= 0" }).min(0, "Phần trăm phải >= 0").max(100, "Phần trăm phải <= 100").nullable().optional(),
    minFee: z.number({ message: "Phí tối thiểu phải >= 0" }).min(0, "Phí tối thiểu phải >= 0").nullable().optional(),
    maxFee: z.number({ message: "Phí tối đa phải >= 0" }).min(0, "Phí tối đa phải >= 0").nullable().optional(),
    maxValue: z.number().optional(),
    minValue: z.number().optional(),

}).refine(
    (data) => {
        if (data.minValue !== undefined && data.maxValue !== undefined) {
            return data.minValue < data.maxValue;
        }
        return true;
    },
    {
        message: "Giá trị tối đa phải lớn hơn tối thiểu",
        path: ["minValue"],
    }
).refine(
    (data) => {
        // Validate percentage is required when componentType is VAT
        if (data.componentType === 'VAT') {
            return data.percentage !== undefined && data.percentage !== null;
        }
        return true;
    },
    {
        message: "Phí phần trăm không được để trống",
        path: ["percentage"],
    }
).refine(
    (data) => {
        // calculationMethod bắt buộc khi KHÔNG phải VAT
        if (data.componentType !== 'VAT') {
            return data.calculationMethod !== undefined && data.calculationMethod !== null && data.calculationMethod !== '';
        }
        return true;
    },
    {
        message: "Chọn phương thức tính",
        path: ["calculationMethod"],
    }
).refine(
    (data) => {
        // Validate minFee <= maxFee
        if (data.minFee !== undefined && data.maxFee !== undefined && data.minFee !== null && data.maxFee !== null) {
            return data.minFee <= data.maxFee;
        }
        return true;
    },
    {
        message: "Phí tối đa phải >= phí tối thiểu",
        path: ["maxFee"],
    }
)
// .refine(
//     (data) => {
//         // Validate: Khi DIRECT (không phải tier), ít nhất 1 field phải có giá trị
//         const isDirect = data.calculationMethod === 'DIRECT';
//         const isNotVAT = data.componentType !== 'VAT';

//         if (isDirect && isNotVAT) {
//             const hasFixedAmount = data.fixedAmount !== undefined && data.fixedAmount !== null && data.fixedAmount >= 0;
//             const hasPercentage = data.percentage !== undefined && data.percentage !== null && data.percentage >= 0;
//             const hasMinFee = data.minFee !== undefined && data.minFee !== null && data.minFee >= 0;
//             const hasMaxFee = data.maxFee !== undefined && data.maxFee !== null && data.maxFee >= 0;

//             return hasFixedAmount || hasPercentage || hasMinFee || hasMaxFee;
//         }
//         return true;
//     },
//     {
//         message: "Ít nhất một trong các trường phí phải có giá trị",
//         path: ["fixedAmount"],
//     }
// );

export type FeeComponentType = z.infer<typeof FeeComponentSchema>;

export const FeeAssignSchema = z.object({})
export type FeeAssignType = z.infer<typeof FeeAssignSchema>