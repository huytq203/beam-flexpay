import type { NotificationRow } from '../types/notification.type'
import { maskDestination } from '../utils/notification.utils'

const createRow = (
  row: Omit<NotificationRow, 'maskedDestination'>
): NotificationRow => ({ ...row, maskedDestination: maskDestination(row.channel, row.destination) })

export const NOTIFICATION_FIXTURE: readonly NotificationRow[] = [
  createRow({ id: 'notify-email-success', scope: 'MASTER', merchantName: 'Highlands Coffee', merchantCode: 'MC000142', event: 'PAYMENT_SUCCESS', channel: 'EMAIL', destination: 'ops@highlands.vn', status: 'ACTIVE', updatedAt: '21/09/2026 09:30' }),
  createRow({ id: 'notify-sms-failed', scope: 'SUB', merchantName: 'HLC Nguyễn Huệ', merchantCode: 'SUB-0142-01', event: 'PAYMENT_FAILED', channel: 'SMS', destination: '0909123456', status: 'ACTIVE', updatedAt: '20/09/2026 16:45' }),
  createRow({ id: 'notify-webhook-refund', scope: 'MASTER', merchantName: 'GS25 Việt Nam', merchantCode: 'MC000217', event: 'REFUND', channel: 'WEBHOOK', destination: 'https://merchant.gs25.com.vn/events/refund', status: 'INACTIVE', updatedAt: '18/09/2026 11:20' }),
  createRow({ id: 'notify-email-settlement', scope: 'SUB', merchantName: 'GS25 Landmark 81', merchantCode: 'SUB-0217-08', event: 'SETTLEMENT', channel: 'EMAIL', destination: 'finance@gs25.com.vn', status: 'ACTIVE', updatedAt: '17/09/2026 14:10' })
]
