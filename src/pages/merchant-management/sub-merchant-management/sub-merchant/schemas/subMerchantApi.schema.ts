import { z } from 'zod'

export const subMerchantApiSchema = z
  .object({
    merchantId: z.string().min(1, 'Vui lòng chọn Merchant cha'),
    name: z.string().trim().min(1, 'Vui lòng nhập tên Sub-merchant').max(255),
    businessField: z.string().max(100),
    inheritPhone: z.boolean(),
    phone: z.string().max(15),
    inheritAddress: z.boolean(),
    address: z.string().max(500)
  })
  .superRefine((value, context) => {
    if (!value.inheritPhone && !value.phone.trim())
      context.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Vui lòng nhập số điện thoại'
      })
    if (!value.inheritAddress && !value.address.trim())
      context.addIssue({
        code: 'custom',
        path: ['address'],
        message: 'Vui lòng nhập địa chỉ'
      })
  })

export type SubMerchantApiDraft = z.infer<typeof subMerchantApiSchema>

export const EMPTY_SUB_MERCHANT_DRAFT: SubMerchantApiDraft = {
  merchantId: '',
  name: '',
  businessField: '',
  inheritPhone: true,
  phone: '',
  inheritAddress: true,
  address: ''
}
