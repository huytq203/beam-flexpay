import type { NotificationFormValues } from '../schemas/notification.schema'
import type { NotificationChannel, NotificationFilters, NotificationRow } from '../types/notification.type'

export const NOTIFICATION_PAGE_SIZE = 10
export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = { query: '', event: 'ALL', channel: 'ALL', status: 'ALL' }

export const maskDestination = (channel: NotificationChannel, value: string): string => {
  if (channel === 'EMAIL') {
    const [name = '', domain = ''] = value.split('@')
    return `${name.slice(0, 1)}***@${domain}`
  }
  if (channel === 'SMS') return `******${value.slice(-4)}`

  try {
    const url = new URL(value)
    const segments = url.pathname.split('/').filter(Boolean)
    return `${url.origin}/${segments.slice(0, 2).join('/')}${segments.length > 2 ? '/…' : ''}`
  } catch {
    return 'Webhook không hợp lệ'
  }
}

export const filterNotifications = (rows: NotificationRow[], filters: NotificationFilters) => {
  const query = filters.query.trim().toLocaleLowerCase('vi')
  return rows.filter((row) =>
    (!query || [row.merchantName, row.merchantCode].some((value) => value.toLocaleLowerCase('vi').includes(query))) &&
    (filters.event === 'ALL' || row.event === filters.event) &&
    (filters.channel === 'ALL' || row.channel === filters.channel) &&
    (filters.status === 'ALL' || row.status === filters.status)
  )
}

export const upsertNotification = (rows: NotificationRow[], values: NotificationFormValues & { id?: string }): NotificationRow[] => {
  const current = rows.find((row) => row.id === values.id)
  const next: NotificationRow = {
    id: values.id ?? `notification-${Date.now()}`,
    merchantName: current?.merchantName ?? values.merchantCode,
    updatedAt: '21/09/2026 10:00',
    ...values,
    maskedDestination: maskDestination(values.channel, values.destination)
  }
  return current ? rows.map((row) => row.id === current.id ? next : row) : [next, ...rows]
}
