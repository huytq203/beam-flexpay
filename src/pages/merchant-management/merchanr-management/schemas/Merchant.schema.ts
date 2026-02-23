import { z } from 'zod'

export const CreateMerchantSchema = z.object({
    name: z.string().min(1, 'Tên merchant không được để trống'),
    code: z.string().min(1, 'Mã merchant không được để trống'),
    contactEmail: z
        .string()
        .min(1, 'Email liên hệ không được để trống')
        .email('Email không đúng định dạng'),
    contactPhone: z
        .string()
        .min(1, 'Số điện thoại không được để trống')
        .regex(/^(0[3-9])\d{8}$/, 'Số điện thoại không đúng định dạng (VD: 0912345678)'),
})

export type CreateMerchantSchemaType = z.infer<typeof CreateMerchantSchema>
