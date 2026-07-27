/** Giờ Việt Nam là UTC+7 quanh năm, không có DST. */
const VIETNAM_UTC_OFFSET_HOURS = 7
const HOUR_MINUTE_PATTERN = /^(\d{1,2}):(\d{2})$/
const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})$/

export interface TimeOverride {
  /** Mốc thời gian bắt đầu, tính theo epoch. */
  baseEpoch: number
  /** Hệ số tua nhanh: 1 là thời gian thật, 600 là một ngày trong 2,4 phút. */
  speed: number
}

/** Đổi giờ treo tường Việt Nam thành epoch. */
const toEpochFromVietnamWallClock = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): number => Date.UTC(year, month - 1, day, hour - VIETNAM_UTC_OFFSET_HOURS, minute)

/** Ngày hôm nay theo lịch Việt Nam, đọc qua các trường UTC đã dịch +7. */
const todayInVietnam = (): { year: number; month: number; day: number } => {
  const shifted = new Date(Date.now() + VIETNAM_UTC_OFFSET_HOURS * 3_600_000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate()
  }
}

const parseBaseEpoch = (value: string): number | null => {
  const isoMatch = ISO_PATTERN.exec(value)
  if (isoMatch) {
    const [, year, month, day, hour, minute] = isoMatch
    return toEpochFromVietnamWallClock(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute)
    )
  }

  const hourMinuteMatch = HOUR_MINUTE_PATTERN.exec(value)
  if (!hourMinuteMatch) return null

  const [, hour, minute] = hourMinuteMatch
  if (Number(hour) > 23 || Number(minute) > 59) return null

  const today = todayInVietnam()
  return toEpochFromVietnamWallClock(
    today.year,
    today.month,
    today.day,
    Number(hour),
    Number(minute)
  )
}

/**
 * Đọc cổng test cảnh mặt trời từ query string. Chỉ hoạt động khi chạy `yarn dev`;
 * bản build production luôn trả `null` nên không có đường ép giờ trên môi trường thật.
 *
 *   ?at=05:30              → bình minh hôm nay
 *   ?at=19:15&speed=600    → hoàng hôn, tua 600 lần (một ngày ≈ 2,4 phút)
 *   ?at=2026-12-21T12:00   → trưa đông chí
 */
export function readTimeOverride(): TimeOverride | null {
  if (!import.meta.env.DEV) return null

  const params = new URLSearchParams(window.location.search)
  const at = params.get('at')
  if (!at) return null

  const baseEpoch = parseBaseEpoch(at.trim())
  if (baseEpoch === null) {
    console.warn(`[time-override] Không đọc được ?at=${at}. Dùng HH:mm hoặc YYYY-MM-DDTHH:mm.`)
    return null
  }

  const rawSpeed = Number(params.get('speed') ?? 1)
  const speed = Number.isFinite(rawSpeed) && rawSpeed > 0 ? rawSpeed : 1

  return { baseEpoch, speed }
}
