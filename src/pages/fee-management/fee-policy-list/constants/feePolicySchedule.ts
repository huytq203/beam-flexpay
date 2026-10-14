import type {
  FeePolicyScheduleAction,
  FeePolicyScheduleStatus
} from '@type/fee.type'

export const SCHEDULE_ACTION_LABEL: Readonly<
  Record<FeePolicyScheduleAction, string>
> = {
  ACTIVATE: 'Mở chính sách',
  DEACTIVATE: 'Khóa chính sách'
}

export const SCHEDULE_STATUS_LABEL: Readonly<
  Record<FeePolicyScheduleStatus, string>
> = {
  PENDING: 'Chờ chạy',
  RUNNING: 'Đang chạy',
  DONE: 'Đã chạy',
  SKIPPED: 'Bỏ qua',
  FAILED: 'Lỗi',
  CANCELLED: 'Đã huỷ'
}

/** Màu chữ dùng token `-strong` để đọc được trên nền nhạt, giống FeeStatusPill. */
export const SCHEDULE_STATUS_TONE: Readonly<
  Record<FeePolicyScheduleStatus, string>
> = {
  PENDING: 'bg-warning/10 text-warning-strong',
  RUNNING: 'bg-accent text-secondary-foreground',
  DONE: 'bg-success/10 text-success-strong',
  SKIPPED: 'bg-muted text-muted-foreground',
  FAILED: 'bg-danger/10 text-danger-strong',
  CANCELLED: 'bg-muted text-muted-foreground'
}

/** Chỉ chính sách đang bật hoặc đang tắt mới hẹn giờ được; BE từ chối các trạng thái còn lại. */
export const SCHEDULABLE_POLICY_STATUSES: readonly string[] = [
  'ACTIVE',
  'INACTIVE'
]

export const SCHEDULE_MIN_LEAD_MS = 60_000
export const SCHEDULE_MAX_LEAD_DAYS = 365
export const SCHEDULE_REASON_MAX_LENGTH = 500
export const SCHEDULE_TIME_ZONE = 'Asia/Ho_Chi_Minh'
export const SCHEDULE_DISPLAY_FORMAT = 'DD/MM/YYYY HH:mm:ss'
