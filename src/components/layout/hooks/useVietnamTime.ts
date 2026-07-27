import { useEffect, useRef, useState } from 'react'
import { readTimeOverride } from './time-override'

const TIME_API_URL =
  'https://timeapi.io/api/time/current/zone?timeZone=Asia%2FHo_Chi_Minh'
const REQUEST_TIMEOUT_MS = 5_000
const RESYNC_INTERVAL_MS = 10 * 60_000

interface TimeApiResponse {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  seconds: number
  milliSeconds: number
  timeZone: string
}

export interface VietnamTime {
  now: Date
  isSynchronized: boolean
}

function toEpoch(response: TimeApiResponse): number {
  return Date.UTC(
    response.year,
    response.month - 1,
    response.day,
    response.hour - 7,
    response.minute,
    response.seconds,
    response.milliSeconds
  )
}

function isValidResponse(value: unknown): value is TimeApiResponse {
  if (!value || typeof value !== 'object') return false
  const response = value as Partial<TimeApiResponse>

  return (
    response.timeZone === 'Asia/Ho_Chi_Minh' &&
    Number.isInteger(response.year) &&
    Number.isInteger(response.month) &&
    Number.isInteger(response.day) &&
    Number.isInteger(response.hour) &&
    Number.isInteger(response.minute) &&
    Number.isInteger(response.seconds) &&
    Number.isInteger(response.milliSeconds)
  )
}

/**
 * Đồng hồ realtime: tick tại client mỗi giây, đồng bộ lại với TimeAPI.io mỗi
 * 10 phút. Khi API không khả dụng, hook tự dùng đồng hồ thiết bị.
 */
export function useVietnamTime(): VietnamTime {
  const offsetRef = useRef(0)
  const hasSynchronizedRef = useRef(false)
  // Cổng test cảnh mặt trời (?at=19:15&speed=600), chỉ tồn tại ở bản dev.
  const [override] = useState(readTimeOverride)
  const [now, setNow] = useState(() => new Date(override?.baseEpoch ?? Date.now()))
  const [isSynchronized, setIsSynchronized] = useState(false)

  useEffect(() => {
    if (override) {
      // Bỏ qua đồng bộ mạng: đang chạy theo đồng hồ giả để xem cảnh đổi.
      const startedAt = Date.now()
      const tickMs = override.speed > 1 ? 250 : 1_000
      const fakeTick = window.setInterval(() => {
        const elapsed = (Date.now() - startedAt) * override.speed
        setNow(new Date(override.baseEpoch + elapsed))
      }, tickMs)
      return () => window.clearInterval(fakeTick)
    }

    let disposed = false

    const synchronize = async () => {
      const controller = new AbortController()
      const timeout = window.setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
      )
      const requestStartedAt = Date.now()

      try {
        const response = await fetch(TIME_API_URL, {
          signal: controller.signal,
          cache: 'no-store'
        })
        if (!response.ok) throw new Error(`Time API returned ${response.status}`)

        const data: unknown = await response.json()
        if (!isValidResponse(data)) throw new Error('Invalid time API response')

        const responseReceivedAt = Date.now()
        const estimatedNetworkDelay =
          (responseReceivedAt - requestStartedAt) / 2
        offsetRef.current =
          toEpoch(data) + estimatedNetworkDelay - responseReceivedAt
        hasSynchronizedRef.current = true

        if (!disposed) {
          setIsSynchronized(true)
          setNow(new Date(Date.now() + offsetRef.current))
        }
      } catch {
        // Giữ offset đã đồng bộ trước đó; chỉ fallback về thiết bị nếu chưa từng
        // lấy được thời gian server trong phiên hiện tại.
        if (!disposed && !hasSynchronizedRef.current) {
          offsetRef.current = 0
          setIsSynchronized(false)
        }
      } finally {
        window.clearTimeout(timeout)
      }
    }

    const tick = window.setInterval(() => {
      setNow(new Date(Date.now() + offsetRef.current))
    }, 1_000)
    const resync = window.setInterval(() => void synchronize(), RESYNC_INTERVAL_MS)
    const handleOnline = () => void synchronize()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void synchronize()
    }

    void synchronize()
    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      disposed = true
      window.clearInterval(tick)
      window.clearInterval(resync)
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [override])

  return { now, isSynchronized }
}
