import { z } from 'zod'

import type { NotificationChannel, NotificationEvent, NotificationScope, NotificationStatus } from '../types/notification.type'

const scopeSchema = z.enum(['MASTER', 'SUB'])
const eventSchema = z.enum(['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'REFUND', 'SETTLEMENT'])
const channelSchema = z.enum(['EMAIL', 'SMS', 'WEBHOOK'])
const statusSchema = z.enum(['ACTIVE', 'INACTIVE'])
const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/

export const notificationSchema = z.object({
  scope: scopeSchema,
  merchantCode: z.string().trim().min(1, 'Vui lòng nhập mã merchant'),
  event: eventSchema,
  channel: channelSchema,
  destination: z.string().trim().min(1, 'Vui lòng nhập đích nhận'),
  status: statusSchema
}).superRefine(({ channel, destination }, context) => {
  const valid = channel === 'EMAIL'
    ? z.email().safeParse(destination).success
    : channel === 'SMS'
      ? PHONE_REGEX.test(destination)
      : z.url().safeParse(destination).success && destination.startsWith('https://')
  if (!valid) context.addIssue({ code: 'custom', path: ['destination'], message: channel === 'EMAIL' ? 'Email không hợp lệ' : channel === 'SMS' ? 'Số điện thoại không hợp lệ' : 'Webhook phải là URL HTTPS hợp lệ' })
})

export type NotificationFormValues = z.infer<typeof notificationSchema>

export const notificationFilterSchema = z.object({
  query: z.string().trim().max(100),
  event: z.enum(['ALL', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'REFUND', 'SETTLEMENT']),
  channel: z.enum(['ALL', 'EMAIL', 'SMS', 'WEBHOOK']),
  status: z.enum(['ALL', 'ACTIVE', 'INACTIVE'])
})

const options = <T extends string>(items: Array<[string, T]>) => items.map(([label, value]) => ({ label, value }))
export const NOTIFICATION_SCOPE_OPTIONS = options<NotificationScope>([['Master', 'MASTER'], ['Sub', 'SUB']])
export const NOTIFICATION_EVENT_OPTIONS = options<NotificationEvent>([['Thanh toán thành công', 'PAYMENT_SUCCESS'], ['Thanh toán thất bại', 'PAYMENT_FAILED'], ['Hoàn tiền', 'REFUND'], ['Đối soát', 'SETTLEMENT']])
export const NOTIFICATION_CHANNEL_OPTIONS = options<NotificationChannel>([['Email', 'EMAIL'], ['SMS', 'SMS'], ['Webhook', 'WEBHOOK']])
export const NOTIFICATION_STATUS_OPTIONS = options<NotificationStatus>([['Hoạt động', 'ACTIVE'], ['Ngưng hoạt động', 'INACTIVE']])
