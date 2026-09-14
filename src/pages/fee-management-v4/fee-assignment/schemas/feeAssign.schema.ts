import { z } from "zod";

export const feeAssignSchema = z.object({
    feePolicyId: z.string({
        message: "Vui lòng chọn chính sách phí"
    }).min(1, "Vui lòng chọn chính sách phí").max(255, "Quá giới hạn ký tự"),
    merchantId: z.string().nullable().optional(),
    bankCode: z.string({
        message: "Không được để trống trường này"
    }).min(1, "Không được để trống trường này"),
    paymentMethod: z.string().nullable().optional(),
    cardType: z.string().nullable().optional(),
    serviceType: z.string({
        message: "Không được để trống trường này"
    }).min(1, "Không được để trống trường này").max(255, "Quá giới hạn ký tự"),
    customerGroup: z.string().transform((value) => value || undefined).optional(),
    status: z.string({
        message: "Không được để trống trường này"
    }).min(1, "Không được để trống trường này").max(255, "Quá giới hạn ký tự"),
    applyType: z.string().optional(),
    account: z.string().optional(),
    applyDate: z.string().optional(),
    createDate: z.string().optional(),
    domain: z.string().optional(),
});

export type FeeAssignType = z.infer<typeof feeAssignSchema>;
