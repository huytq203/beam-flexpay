import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export interface ShiftClock {
  /** Lời chào theo khung giờ thật của máy người dùng. */
  greeting: string
  time: string
  date: string
}

const greetingFor = (hour: number): string => {
  if (hour < 5) return 'Ca đêm'
  if (hour < 11) return 'Chào buổi sáng'
  if (hour < 14) return 'Chào buổi trưa'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

/*
 * dayjs của dự án đang chạy locale mặc định (tiếng Anh) và đổi locale toàn cục
 * sẽ đổi định dạng ngày ở mọi màn khác, nên thứ trong tuần lấy qua Intl —
 * đúng tiếng Việt mà không đụng tới phần còn lại của app.
 */
const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' })

const readClock = (): ShiftClock => {
  const now = dayjs()
  return {
    greeting: greetingFor(now.hour()),
    time: now.format('HH:mm'),
    date: `${weekdayFormatter.format(now.toDate())}, ${now.format('DD/MM/YYYY')}`
  }
}

/** Đồng hồ ca trực: cập nhật mỗi phút, đủ cho một nhãn HH:mm. */
export const useShiftClock = (): ShiftClock => {
  const [clock, setClock] = useState<ShiftClock>(readClock)

  useEffect(() => {
    const timer = window.setInterval(() => setClock(readClock()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return clock
}
