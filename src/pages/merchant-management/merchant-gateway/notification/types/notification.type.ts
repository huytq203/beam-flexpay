export type NotificationScope = 'MASTER' | 'SUB'
export type NotificationEvent =
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REFUND'
  | 'SETTLEMENT'
export type NotificationChannel = 'EMAIL' | 'SMS' | 'WEBHOOK'
export type NotificationStatus = 'ACTIVE' | 'INACTIVE'

export interface NotificationRow {
  id: string
  scope: NotificationScope
  merchantName: string
  merchantCode: string
  event: NotificationEvent
  channel: NotificationChannel
  maskedDestination: string
  destination: string
  status: NotificationStatus
  updatedAt: string
}

export interface NotificationFilters {
  query: string
  event: 'ALL' | NotificationEvent
  channel: 'ALL' | NotificationChannel
  status: 'ALL' | NotificationStatus
}
