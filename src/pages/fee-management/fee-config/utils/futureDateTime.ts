import dayjs, { type Dayjs } from 'dayjs'

/**
 * Chặn chọn mốc thời gian đã qua trên ô ngày hiệu lực.
 *
 * Backend chỉ đòi mốc bắt đầu ở tương lai KHI nó thật sự thay đổi
 * (`validateValidFromNotInPast` tách khỏi `validateValidityPeriod` đúng vì lý do
 * đó). Nên chặn ở đây là chặn thao tác chọn, không phải chặn giá trị: một bản
 * ghi cũ mang mốc quá khứ vẫn hiển thị và vẫn lưu lại được, chỉ không đổi sang
 * một mốc quá khứ khác.
 */

const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(0, to - from) }, (_, index) => from + index)

/** Mốc sớm nhất được phép chọn: hiện tại, hoặc mốc bắt đầu nếu nó ở tương lai. */
const resolveFloor = (notBefore?: Dayjs | null): Dayjs => {
  const now = dayjs()
  return notBefore && notBefore.isAfter(now) ? notBefore : now
}

export const disablePastDate =
  (notBefore?: Dayjs | null) =>
  (current: Dayjs): boolean =>
    Boolean(current) && current.isBefore(resolveFloor(notBefore), 'day')

export const disablePastTime =
  (notBefore?: Dayjs | null) =>
  (current: Dayjs | null) => {
    const floor = resolveFloor(notBefore)
    // Chỉ ngày trùng với mốc sàn mới phải cắt giờ; ngày sau đó mở hết.
    if (!current || !current.isSame(floor, 'day')) return {}

    return {
      disabledHours: () => range(0, floor.hour()),
      disabledMinutes: (hour: number) =>
        hour === floor.hour() ? range(0, floor.minute()) : [],
      disabledSeconds: (hour: number, minute: number) =>
        hour === floor.hour() && minute === floor.minute()
          ? range(0, floor.second() + 1)
          : []
    }
  }
