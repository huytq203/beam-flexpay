import { z } from "zod";

export const PolicySchema = z.object({
  name: z.string().min(1, "Tên chính sách không được để trống"),
  startDate: z.string().min(1, "Chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Chọn ngày kết thúc"),
  priority: z.string().min(1, "Chọn mức độ ưu tiên"),
  status: z.string().min(1, "Chọn trạng thái"),
  description: z.string().optional(),
});

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