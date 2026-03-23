import { z } from "zod";

export const feeAssignSchema = z.object({
    feePolicyId: z.string().min(1, "Vui lòng chọn chính sách phí").max(255, "Quá giới hạn ký tự"),
    merchantId: z.string().nullable().optional(),
    bankCode: z.string().min(1, "Không được để trống trường này"),
    paymentMethod:z.string().nullable().optional(),
    cardType:  z.string().nullable().optional(),
    serviceType: z.string().min(1, "Không được để trống trường này").max(255, "Quá giới hạn ký tự"),
    customerGroup: z.string().optional(),
    status: z.string().min(1, "Không được để trống trường này").max(255, "Quá giới hạn ký tự"),
    applyType: z.string().optional(),
    account: z.string().optional(),
    applyDate: z.string().optional(),
    createDate: z.string().optional(),
    domain: z.string().optional(),
}).refine(
    (data) => {
        if (data.applyType === "1" && (!data.customerGroup || data.customerGroup.trim().length === 0)) {
            return false;
        }
        return true;
    },
    {
        message: "Tài khoản/Nhóm khách hàng không được để trống",
        path: ["customerGroup"],
    }
);

export type FeeAssignType = z.infer<typeof feeAssignSchema>;