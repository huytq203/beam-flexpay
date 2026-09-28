import type {
  NotificationFields,
  NotificationListItem
} from '@/app/services/merchantNotificationApi'
import { EMAIL_FIELD_MAX_LENGTH } from '../constants/notification.constants'

export type EmailFieldKey =
  | 'notificationEmails'
  | 'reconciliationEmails'
  | 'invoiceEmails'

export const EMAIL_FIELDS: { key: EmailFieldKey; label: string }[] = [
  { key: 'notificationEmails', label: 'Email thông báo' },
  { key: 'reconciliationEmails', label: 'Email đối soát' },
  { key: 'invoiceEmails', label: 'Email hóa đơn' }
]

/** Email trong form giữ dạng chuỗi, mỗi dòng/dấu phẩy một địa chỉ. */
export interface NotificationDraft
  extends Omit<NotificationFields, EmailFieldKey> {
  notificationEmails: string
  reconciliationEmails: string
  invoiceEmails: string
  reason: string
}

export type NotificationDraftErrors = Partial<
  Record<keyof NotificationDraft, string>
>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Trùng email (không phân biệt hoa thường) được gộp như cách BE chuẩn hóa.
export const splitEmails = (value: string): string[] => [
  ...new Set(
    value
      .split(/[\s,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
]

export const toDraft = (row?: NotificationListItem): NotificationDraft => ({
  transactionNotificationEnabled: row?.transactionNotificationEnabled ?? true,
  channels: row?.channels ?? ['EMAIL'],
  notificationEmails: (row?.notificationEmails ?? []).join('\n'),
  reconciliationEmails: (row?.reconciliationEmails ?? []).join('\n'),
  invoiceEmails: (row?.invoiceEmails ?? []).join('\n'),
  active: row?.active ?? true,
  reason: ''
})

export const toFields = (draft: NotificationDraft): NotificationFields => ({
  transactionNotificationEnabled: draft.transactionNotificationEnabled,
  channels: draft.transactionNotificationEnabled ? draft.channels : [],
  notificationEmails: splitEmails(draft.notificationEmails),
  reconciliationEmails: splitEmails(draft.reconciliationEmails),
  invoiceEmails: splitEmails(draft.invoiceEmails),
  active: draft.active
})

export const validateDraft = (
  draft: NotificationDraft,
  requireReason: boolean
): NotificationDraftErrors => {
  const errors: NotificationDraftErrors = {}
  if (draft.transactionNotificationEnabled && draft.channels.length === 0)
    errors.channels = 'Chọn ít nhất một kênh khi bật thông báo giao dịch'
  for (const { key } of EMAIL_FIELDS) {
    const emails = splitEmails(draft[key])
    if (emails.some((email) => !EMAIL_PATTERN.test(email)))
      errors[key] = 'Có địa chỉ email không hợp lệ'
    else if (emails.join(',').length > EMAIL_FIELD_MAX_LENGTH)
      errors[key] = `Tổng độ dài tối đa ${EMAIL_FIELD_MAX_LENGTH} ký tự`
  }
  if (requireReason && !draft.reason.trim())
    errors.reason = 'Vui lòng nhập lý do thay đổi'
  return errors
}

const FIELD_KEYS = [
  'transactionNotificationEnabled',
  'channels',
  'notificationEmails',
  'reconciliationEmails',
  'invoiceEmails',
  'active'
] as const

const FIELD_LABEL: Record<keyof NotificationFields, string> = {
  transactionNotificationEnabled: 'Thông báo giao dịch',
  channels: 'Kênh thông báo',
  notificationEmails: 'Email thông báo',
  reconciliationEmails: 'Email đối soát',
  invoiceEmails: 'Email hóa đơn',
  active: 'Trạng thái sử dụng'
}

const sameValue = (left: unknown, right: unknown): boolean =>
  Array.isArray(left) && Array.isArray(right)
    ? left.length === right.length &&
      [...left].sort().join() === [...right].sort().join()
    : left === right

/** Chỉ các field khác giá trị hiện tại: PATCH gửi đúng phần người dùng đổi. */
export const diffFields = (
  row: NotificationListItem,
  next: NotificationFields
): Partial<NotificationFields> =>
  Object.fromEntries(
    FIELD_KEYS.filter((key) => !sameValue(row[key], next[key])).map((key) => [
      key,
      next[key]
    ])
  )

export const describeChanges = (
  changes: Partial<NotificationFields>
): string[] =>
  FIELD_KEYS.filter((key) => key in changes).map((key) => FIELD_LABEL[key])

/**
 * Khi tạo mới, BE hiểu nhóm email bị bỏ trống là "dùng email chính của ví",
 * còn danh sách rỗng gửi tường minh là "không gửi email" — nên bỏ hẳn nhóm rỗng.
 */
export const omitEmptyEmails = (
  fields: NotificationFields
): Partial<NotificationFields> =>
  Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => !Array.isArray(value) || value.length > 0
    )
  )
