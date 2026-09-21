import { describe, expect, it } from 'vitest'

import { notificationSchema } from '../schemas/notification.schema'
import type { NotificationChannel } from '../types/notification.type'
import { maskDestination } from '../utils/notification.utils'

const values = (channel: NotificationChannel, destination: string) => ({ scope: 'MASTER' as const, merchantCode: 'MC000142', event: 'PAYMENT_SUCCESS' as const, channel, destination, status: 'ACTIVE' as const })

describe('notificationSchema', () => {
  it('validates destination by channel', () => {
    expect(notificationSchema.safeParse(values('EMAIL', 'ops@highlands.vn')).success).toBe(true)
    expect(notificationSchema.safeParse(values('EMAIL', '0909123456')).success).toBe(false)
    expect(notificationSchema.safeParse(values('SMS', '0909123456')).success).toBe(true)
    expect(notificationSchema.safeParse(values('WEBHOOK', 'https://merchant.example.vn/events')).success).toBe(true)
    expect(notificationSchema.safeParse(values('WEBHOOK', 'http://merchant.example.vn/events')).success).toBe(false)
  })

  it('masks destinations before presentation', () => {
    expect(maskDestination('EMAIL', 'ops@highlands.vn')).toBe('o***@highlands.vn')
    expect(maskDestination('SMS', '0909123456')).toBe('******3456')
  })
})
