import { z } from 'zod'

import type {
  KeyConnectionScope,
  KeyConnectionStatus
} from '../types/keyConnection.type'

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
const MASKED_SECRET_REGEX = /^•{4,}[A-Za-z0-9]{4,}$/

export const isValidIpv4 = (value: string): boolean => IPV4_REGEX.test(value)

const scopeSchema = z.enum(['MASTER', 'SUB'])
const statusSchema = z.enum(['ACTIVE', 'INACTIVE'])

export const keyConnectionSchema = z.object({
  scope: scopeSchema,
  merchantCode: z.string().trim().min(1, 'Vui lòng nhập mã merchant'),
  clientId: z.string().trim().min(1, 'Vui lòng nhập Client ID'),
  maskedSecret: z
    .string()
    .min(1, 'Vui lòng nhập secret đã che')
    .regex(MASKED_SECRET_REGEX, 'Secret phải ở dạng đã che'),
  ipWhitelist: z.array(
    z.string().regex(IPV4_REGEX, 'IP whitelist không hợp lệ')
  ),
  webhookUrl: z
    .url('Webhook URL không hợp lệ')
    .refine((url) => url.startsWith('https://'), 'Webhook phải dùng HTTPS'),
  status: statusSchema
})

export type KeyConnectionFormValues = z.infer<typeof keyConnectionSchema>

export const keyConnectionDialogSchema = keyConnectionSchema
  .omit({ ipWhitelist: true })
  .extend({
    ipWhitelist: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === '' ||
          value
            .split(/[\n,]/)
            .map((item) => item.trim())
            .every(isValidIpv4),
        'Mỗi IP whitelist phải là IPv4 hợp lệ'
      )
  })

export type KeyConnectionDialogValues = z.input<typeof keyConnectionDialogSchema>

export const parseIpWhitelist = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)

export const KEY_CONNECTION_SCOPE_OPTIONS: Array<{
  label: string
  value: KeyConnectionScope
}> = [
  { label: 'Master', value: 'MASTER' },
  { label: 'Sub', value: 'SUB' }
]

export const KEY_CONNECTION_STATUS_OPTIONS: Array<{
  label: string
  value: KeyConnectionStatus
}> = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Ngưng hoạt động', value: 'INACTIVE' }
]
