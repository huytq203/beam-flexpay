import { z } from "zod";

export const PolicySchema = z.object({
  name: z.string().min(1, "Tên chính sách không được để trống"),
  validFrom: z.string().min(1, "Chọn ngày bắt đầu"),
  validTo: z.string().min(1, "Chọn ngày kết thúc"),
  priority: z.number().min(0, "Chọn mức độ ưu tiên"),
  status: z.string().min(1, "Chọn trạng thái"),
  feeDomain: z.string().min(1, "Chọn phí miền"),
  currency: z.string().min(1, "Currency không được để trống"),
  serviceType: z.string().min(1, "Chọn loại dịch vụ"),
  description: z.string().optional(),
}).refine(
  (data) => !data.validFrom || !data.validTo || new Date(data.validTo) >= new Date(data.validFrom),
  {
    message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
    path: ["validTo"], // lỗi sẽ hiện ở validTo
  }
);

export type PolicyType = z.infer<typeof PolicySchema>;



export const FeeItemSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  percent: z.number().optional(),
  fixed: z.number().optional(),
  minFee: z.number().optional(),
  maxFee: z.number().optional(),
});

export const FeeFormSchema = z.object({
  fees: z.array(FeeItemSchema)
});

export type FeeFormType = z.infer<typeof FeeFormSchema>;