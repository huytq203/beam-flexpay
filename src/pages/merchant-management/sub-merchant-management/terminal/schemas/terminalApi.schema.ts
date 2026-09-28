import { z } from 'zod'

export const terminalApiSchema = z.object({
  merchantId: z.string().min(1, 'Vui lòng chọn Master Merchant'),
  subMerchantId: z.string().min(1, 'Vui lòng chọn Sub-merchant'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên Terminal').max(100),
  terminalType: z.enum(['POS', 'ONLINE', 'QR']),
  address: z.string().max(400),
  contactPerson: z.string().max(50),
  inheritContactPhone: z.boolean(),
  contactPhone: z.string().max(15),
  note: z.string().max(500)
}).superRefine((value, context) => {
  if (!value.inheritContactPhone && !value.contactPhone.trim()) context.addIssue({ code: 'custom', path: ['contactPhone'], message: 'Vui lòng nhập số điện thoại' })
  if (value.terminalType === 'POS' && !value.address.trim()) context.addIssue({ code: 'custom', path: ['address'], message: 'Terminal POS cần địa chỉ' })
})

export type TerminalApiDraft = z.infer<typeof terminalApiSchema>
