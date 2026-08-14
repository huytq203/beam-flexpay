import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { isDate } from 'lodash'
import { DateFormat, FullFormatTime } from '@constants/datetime'

dayjs.extend(utc)

export const UTC_OFFSET_HOURS = {
  UTC: 0,
  VIETNAM: 7
} as const

export type UTCOffsetHours =
  (typeof UTC_OFFSET_HOURS)[keyof typeof UTC_OFFSET_HOURS]

export function getDate(date: string | null | undefined) {
  return date?.split('T')?.[0] ?? null
}

export const getStringDateFromMoment = (date: string | undefined) => {
  if (date) return dayjs(date).toISOString()
  return undefined
}

export const formatUTCToLocalDate = (time?: string | null) => {
  if (!time) return ''
  return dayjs(time).format(DateFormat)
}

export const formatUTCToLocalDateTime = (time?: string | null) => {
  if (!time) return ''
  return dayjs(time).format(FullFormatTime)
}

export const formatUTCDateTimeByOffset = (
  time: string | null | undefined,
  utcOffsetHours: UTCOffsetHours
): string => {
  if (!time) return ''

  const utcDateTime = dayjs.utc(time)
  if (!utcDateTime.isValid()) return time

  return utcDateTime
    .utcOffset(utcOffsetHours * 60)
    .format(FullFormatTime)
}

export const getVNDateStringFromUTCTimeString = formatUTCToLocalDate
export const getVNDateTimeStringFromUTCTimeString = formatUTCToLocalDateTime

export const fnDisableStartDate = (current: dayjs.Dayjs, to: dayjs.Dayjs) => {
  current = current.startOf('day')
  to = to.endOf('day')
  return current > dayjs().endOf('day') || current > dayjs(to, 'YYYY-MM-DD')
}

export const fnDisableEndDate = (current: dayjs.Dayjs, from: dayjs.Dayjs) => {
  current = current.endOf('day')
  from = from.startOf('day')
  return current > dayjs().endOf('day') || current < dayjs(from, 'YYYY-MM-DD')
}

export const extractNativeDateFromPicker = (value: unknown): Date | null => {
  if (!value) return null

  if (isDate(value)) return value

  if (typeof value === 'object' && value !== null) {
    const dateObj = value as Record<string, unknown>

    if (dateObj.$d instanceof Date) return dateObj.$d
    if (dateObj._d instanceof Date) return dateObj._d

    if (typeof dateObj.toDate === 'function') {
      return (dateObj.toDate as () => Date)()
    }
  }

  return null
}

export const validateFutureDatetime = (
  _: unknown,
  value: unknown
): Promise<void> => {
  if (!value) return Promise.resolve()

  const selectedDate = extractNativeDateFromPicker(value)
  if (!selectedDate) return Promise.resolve()

  if (selectedDate.getTime() < new Date().getTime()) {
    return Promise.reject(
      new Error('Ngày giờ áp dụng phải lớn hơn hoặc bằng ngày giờ hiện tại')
    )
  }
  return Promise.resolve()
}
