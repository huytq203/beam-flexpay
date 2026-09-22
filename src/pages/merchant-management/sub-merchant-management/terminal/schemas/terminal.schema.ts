import { z } from 'zod'

export const terminalFormSchema = z.object({
  parentMerchantId: z.string().min(1, 'Vui lòng chọn Merchant cha'),
  subMerchantId: z.string().min(1, 'Vui lòng chọn Sub-merchant'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên Terminal').max(255),
  type: z.enum(['STATIC_QR', 'DYNAMIC_QR', 'POS', 'SOFTPOS']),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ'),
  phone: z.string(),
  note: z.string().max(500)
})

export type TerminalFormValue = z.infer<typeof terminalFormSchema>
