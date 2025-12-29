import { z } from "zod";

export const feeAssignSchema = z.object({
    feePolicyId: z.string().min(1, "Vui lòng chọn chính sách phí").max(255, "Quá giới hạn ký tự"),
    merchantId: z.string().nullable().optional(),
    bankCode: z.string().nullable().optional(),
    paymentMethod:z.string().nullable().optional(),
    cardType:  z.string().nullable().optional(),
    serviceType: z.string().min(1, "Không được để trống trường này").max(255, "Quá giới hạn ký tự"),
    customerGroup: z.string().optional(),
    status: z.string().min(1, "Không được để trống trường này").max(255, "Quá giới hạn ký tự"),
    applyType: z.string().optional(),
    account: z.string().optional(),
    applyDate: z.string().optional(),
    createDate: z.string().optional(),
}).refine(
    (data) => {
        if (data.applyType === "1") {
            return data.account && data.account.trim().length > 0;
        }
        if (data.applyType === "2") {
            return data.customerGroup && data.customerGroup.trim().length > 0;
        }
        return true;
    },
    {
        message: "Vui lòng nhập thông tin bắt buộc",
        path: ["applyType"], 
    }
).refine(
    (data) => {
        if (data.applyType === "1" && (!data.account || data.account.trim().length === 0)) {
            return false;
        }
        return true;
    },
    {
        message: "Tài khoản không được để trống",
        path: ["account"],
    }
).refine(
    (data) => {
        if (data.applyType === "2" && (!data.customerGroup || data.customerGroup.trim().length === 0)) {
            return false;
        }
        return true;
    },
    {
        message: "Nhóm khách hàng không được để trống",
        path: ["customerGroup"],
    }
);

export type FeeAssignType = z.infer<typeof feeAssignSchema>;