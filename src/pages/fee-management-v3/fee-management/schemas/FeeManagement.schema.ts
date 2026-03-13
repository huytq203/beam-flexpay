import { z } from "zod"
import { normalizeText } from "@utils/helperFunctions"

export const PolicySchema = z.object({
    name: z.string().min(1, "Tên chính sách không được để trống").max(150, "Tối đa 150 ký tự").transform(normalizeText),
    validFrom: z.string().min(1, "Chọn ngày bắt đầu"),
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
    currency: z.string().min(1, "Đơn vị thanh toán không được để trống"),
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
)

export type PolicyType = z.infer<typeof PolicySchema>
