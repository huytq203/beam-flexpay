import { useEffect, useRef, useState } from 'react'
import { readTimeOverride } from './time-override'

const REQUEST_TIMEOUT_MS = 5_000
const RESYNC_INTERVAL_MS = 10 * 60_000
const MAX_TRUSTED_SERVER_DRIFT_MS = 2 * 60_000

export interface VietnamTime {
  now: Date
  isSynchronized: boolean
}

/**
 * Tính độ lệch từ HTTP Date của chính máy chủ CMS. Header này chỉ chính xác đến
 * giây nên dùng trung điểm request để giảm sai số mạng.
 */
export function calculateServerOffset(
  serverDate: string | null,
  requestStartedAt: number,
  responseReceivedAt: number
): number | null {
  if (!serverDate) return null

  const serverEpoch = Date.parse(serverDate)
  if (!Number.isFinite(serverEpoch)) return null

  const requestMidpoint =
    requestStartedAt + (responseReceivedAt - requestStartedAt) / 2
  const offset = serverEpoch - requestMidpoint

  // Đồng hồ auth chỉ mang tính hiển thị. Không để một nguồn server sai kéo giờ
  // thiết bị lệch nhiều phút như sự cố TimeAPI trước đây.
  return Math.abs(offset) <= MAX_TRUSTED_SERVER_DRIFT_MS ? offset : null
}

/**
 * Đồng hồ realtime: tick tại client mỗi giây, đồng bộ lại với HTTP Date của
 * chính origin CMS mỗi 10 phút. Khi không đồng bộ được, hook dùng giờ thiết bị.
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
        const syncUrl = new URL('/', window.location.origin)
        syncUrl.searchParams.set('time-sync', String(requestStartedAt))
        const response = await fetch(syncUrl, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store',
          credentials: 'same-origin'
        })
        if (!response.ok) {
          throw new Error(`Time sync returned ${response.status}`)
        }

        const responseReceivedAt = Date.now()
        const serverOffset = calculateServerOffset(
          response.headers.get('date'),
          requestStartedAt,
          responseReceivedAt
        )
        if (serverOffset === null) throw new Error('Untrusted server time')

        offsetRef.current = serverOffset
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
