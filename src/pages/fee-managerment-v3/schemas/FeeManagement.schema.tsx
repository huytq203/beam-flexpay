import { z } from "zod";

export const PolicySchema = z.object({
  name: z.string().min(1, "Tên chính sách không được để trống"),
  validFrom: z.string().min(1, "Chọn ngày bắt đầu"),
  validTo: z.string().nullable().optional(),
  priority: z.number({
    message: "Chọn mức độ ưu tiên",
  }).min(0, "Chọn mức độ ưu tiên"),
  status: z.string({
    message: "Chọn trạng thái",
  }).min(1, "Chọn trạng thái"),
  feeDomain: z.string({
    message: "Chọn phí miền",
  }).min(1, "Chọn phí miền"),
  currency: z.string().min(1, "Currency không được để trống"),
  serviceType: z.string({
    message: "Chọn loại dịch vụ",
  }).min(1, "Chọn loại dịch vụ"),
  description: z.string().max(255, 'Tối đa 255 ký tự').optional(),
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
  componentType: z.string().min(1, "Chọn loại phí"),
  baseOn: z.string().min(1, "Chọn tính dựa trên"),
  payerType: z.string().min(1, "Chọn người chịu phí"),
  beneficiaryType: z.string().min(1, "Chọn người hưởng phí"),
  roundMode: z.string().min(1, "Chọn công thức làm tròn"),
  calculationMethod: z.number().or(z.string()), // Select might return string
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
  );

export type FeeComponentType = z.infer<typeof FeeComponentSchema>;

export const FeeAssignSchema = z.object({})
export type FeeAssignType=z.infer<typeof FeeAssignSchema>