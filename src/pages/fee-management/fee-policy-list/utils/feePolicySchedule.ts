import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { FeePolicyScheduleAction } from '@type/fee.type'
import {
  SCHEDULABLE_POLICY_STATUSES,
  SCHEDULE_DISPLAY_FORMAT,
  SCHEDULE_TIME_ZONE
} from '../constants/feePolicySchedule'

dayjs.extend(utc)
dayjs.extend(timezone)

/** Giờ địa phương từ date picker -> ISO instant (UTC) gửi cho BE. */
export const toRunAtIso = (localValue: string): string =>
  dayjs(localValue).toDate().toISOString()

export const formatScheduleTime = (value: string | null): string =>
  value
    ? dayjs(value).tz(SCHEDULE_TIME_ZONE).format(SCHEDULE_DISPLAY_FORMAT)
    : '—'

export const isSchedulablePolicy = (status: string): boolean =>
  SCHEDULABLE_POLICY_STATUSES.includes(status)

/** Hành động duy nhất làm ngay được: đảo trạng thái hiện tại (đang bật thì khóa, còn lại thì mở). */
export const immediateActionFor = (
  policyStatus: string
): FeePolicyScheduleAction =>
  policyStatus === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'
