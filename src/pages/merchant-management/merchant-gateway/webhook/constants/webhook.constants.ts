import type {
  WebhookDelivery,
  WebhookDeliveryStatus,
  WebhookLevel,
  WebhookSource
} from '@/app/services/merchantWebhookApi'

export const WEBHOOK_URL_MAX = 500
export const REASON_MAX = 500

export const DELIVERY_STATUS_LABEL: Record<WebhookDeliveryStatus, string> = {
  PENDING: 'Chờ gửi',
  IN_FLIGHT: 'Đang gửi',
  DELIVERED: 'Đã gửi',
  DEAD: 'Ngừng gửi'
}

export const DELIVERY_STATUS_COLOR: Record<WebhookDeliveryStatus, string> = {
  PENDING: 'warning',
  IN_FLIGHT: 'processing',
  DELIVERED: 'success',
  DEAD: 'error'
}

export const ORDER_STATUS_LABEL: Record<
  WebhookDelivery['orderStatus'],
  string
> = {
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy'
}

export const DELIVERY_ERROR_LABEL: Record<string, string> = {
  NO_SIGNING_CREDENTIAL: 'Chưa có khóa ký kết nối',
  SIGNING_UNAVAILABLE: 'Hệ thống ký tạm thời không khả dụng',
  DELIVERY_UNAVAILABLE: 'Không gửi được tới merchant',
  TARGET_REJECTED: 'Địa chỉ đích bị chặn (không phải IP công khai)',
  ATTEMPTS_EXHAUSTED: 'Đã hết số lần gửi lại',
  EVENT_EXPIRED: 'Sự kiện quá hạn gửi'
}

export const WEBHOOK_LEVEL_LABEL: Record<WebhookLevel, string> = {
  MASTER: 'Master',
  SUB: 'Sub-merchant'
}

export const WEBHOOK_SOURCE_LABEL: Record<WebhookSource, string> = {
  OWN: 'Cấu hình riêng',
  INHERITED: 'Kế thừa Master',
  NONE: 'Chưa cấu hình'
}

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

export const WEBHOOK_LEVEL_OPTIONS = toOptions(WEBHOOK_LEVEL_LABEL)
export const WEBHOOK_SOURCE_OPTIONS = toOptions(WEBHOOK_SOURCE_LABEL)

export const WEBHOOK_ENABLED_OPTIONS = [
  { value: 'true', label: 'Đang bật' },
  { value: 'false', label: 'Đang tắt' }
]
