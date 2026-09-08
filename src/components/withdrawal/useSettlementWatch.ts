import { useEffect, useState } from 'react'

/** Job nền của user-wallet quét mỗi 30 giây; 5 giây là đủ mịn để bắt kịp. */
export const SETTLEMENT_POLL_INTERVAL_MS = 5_000

/**
 * Cửa sổ theo dõi có trần. Lệnh không về đích sau ngần này thì đã sang địa hạt
 * đối soát chứ không còn là chờ job nền, nên poll tiếp chỉ tốn request.
 */
const SETTLEMENT_WATCH_WINDOW_MS = 90_000

/**
 * Mở một cửa sổ theo dõi có giới hạn khi lệnh rút đã duyệt nhưng chưa ghi sổ.
 *
 * Cửa sổ đóng vĩnh viễn cho mỗi `watchKey`: hết giờ là dừng hẳn, không tự mở
 * lại khi component render tiếp, để màn chi tiết mở lâu không biến thành vòng
 * poll vô hạn. Đổi giao dịch (`watchKey` mới) thì được một cửa sổ mới.
 */
export const useSettlementWatch = (
  isSettling: boolean,
  watchKey: string
): { isWatching: boolean } => {
  const [expiredKey, setExpiredKey] = useState<string | null>(null)

  useEffect(() => {
    if (!isSettling) return

    const timer = setTimeout(
      () => setExpiredKey(watchKey),
      SETTLEMENT_WATCH_WINDOW_MS
    )
    return () => clearTimeout(timer)
  }, [isSettling, watchKey])

  return { isWatching: isSettling && expiredKey !== watchKey }
}
