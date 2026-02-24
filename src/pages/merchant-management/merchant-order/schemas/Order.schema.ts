import { z } from 'zod';

export const orderSchema = z.object({
    merchantId: z
        .string({ error: 'Vui lòng chọn Merchant' })
        .min(1, 'Vui lòng chọn Merchant'),
    orderCode: z
        .string({ error: 'Vui lòng nhập mã đơn hàng' })
        .min(1, 'Vui lòng nhập mã đơn hàng')
        .max(50, 'Mã đơn hàng không được quá 50 ký tự'),
    amount: z
        .number({ error: 'Vui lòng nhập số tiền' })
        .min(1, 'Số tiền phải lớn hơn 0'),
    description: z
        .string()
        .max(500, 'Mô tả không được quá 500 ký tự')
        .optional(),
    purpose: z
        .string({ error: 'Vui lòng nhập mục đích thanh toán' })
        .min(1, 'Vui lòng nhập mục đích thanh toán')
        .max(200, 'Mục đích không được quá 200 ký tự'),
    bankCode: z
        .string({ error: 'Vui lòng chọn ngân hàng' })
        .min(1, 'Vui lòng chọn ngân hàng'),
    currency: z.string(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
