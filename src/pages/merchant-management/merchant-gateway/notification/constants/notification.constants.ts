import type {
  NotificationChannel,
  NotificationScope,
  NotificationSource
} from '@/app/services/merchantNotificationApi'

export const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  EMAIL: 'Email',
  SMS: 'SMS',
  PUSH: 'Push',
  WEBHOOK: 'Webhook'
}

export const CHANNEL_OPTIONS = (
  ['EMAIL', 'SMS', 'PUSH', 'WEBHOOK'] as const
).map((value) => ({ value, label: CHANNEL_LABEL[value] }))

export const SCOPE_OPTIONS: { label: string; value: NotificationScope }[] = [
  { label: 'Master', value: 'MASTER' },
  { label: 'Sub-merchant', value: 'SUB' }
]

export const SOURCE_PRESENTATION: Record<
  NotificationSource,
  { label: string; color: 'processing' | 'default' | 'warning' }
> = {
  OWN: { label: 'Cấu hình riêng', color: 'processing' },
  INHERITED: { label: 'Kế thừa Master', color: 'default' },
  SYSTEM_DEFAULT: { label: 'Mặc định hệ thống', color: 'warning' }
}

export const SOURCE_OPTIONS = (
  ['OWN', 'INHERITED', 'SYSTEM_DEFAULT'] as const
).map((value) => ({ value, label: SOURCE_PRESENTATION[value].label }))

/** Giới hạn độ dài mỗi trường email khi BE nối các địa chỉ lại để lưu. */
export const EMAIL_FIELD_MAX_LENGTH = 255
/** BE từ chối xuất quá số dòng này và không tự cắt bớt. */
export const NOTIFICATION_EXPORT_LIMIT = 50_000
