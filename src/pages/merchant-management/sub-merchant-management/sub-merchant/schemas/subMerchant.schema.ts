import { z } from 'zod'

const PHONE_PATTERN = /^[0-9 +().-]{9,20}$/

export const subMerchantFormSchema = z
  .object({
    parentMerchantId: z.string().min(1, 'Vui lòng chọn Merchant cha'),
    name: z.string().trim().min(1, 'Vui lòng nhập tên Sub-merchant').max(255),
    phoneInherited: z.boolean(),
    phone: z.string(),
    addressInherited: z.boolean(),
    address: z.string(),
    businessField: z.string().min(1, 'Vui lòng chọn lĩnh vực kinh doanh')
  })
  .superRefine((value, context) => {
    if (!value.phoneInherited && !PHONE_PATTERN.test(value.phone.trim())) {
      context.addIssue({
        code: 'custom',
        message: 'Số điện thoại không hợp lệ',
        path: ['phone']
      })
    }
    if (!value.addressInherited && !value.address.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Vui lòng nhập địa chỉ Sub-merchant',
        path: ['address']
      })
    }
  })

export type SubMerchantFormValue = z.infer<typeof subMerchantFormSchema>
